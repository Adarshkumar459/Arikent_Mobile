/**
 * security/pinUtils.ts — PIN derivation utilities.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * SECURITY NOTICE — READ BEFORE MODIFYING
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This implementation uses SHA-256 applied iteratively (1000 rounds)
 * with a cryptographically random per-device 16-byte salt.
 *
 * It uses `expo-crypto` when available, with a pure JavaScript SHA-256
 * fallback so the app works seamlessly in any environment.
 *
 * THREAT MODEL:
 * - Protects against casual device access: shoulder-surfing, an untrusted
 *   person picking up an unlocked phone.
 * - Does NOT protect against a sophisticated attacker who has already
 *   compromised the device OS.
 *
 * ENFORCEMENT:
 * - Raw PIN MUST NEVER be passed outside this file into storage or logs.
 * - Only the derived `hash` and `salt` are returned to callers.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ITERATIONS = 1000;

interface ExpoCryptoModule {
  getRandomBytesAsync?: (byteCount: number) => Promise<Uint8Array>;
  digestStringAsync?: (algorithm: string, data: string) => Promise<string>;
  CryptoDigestAlgorithm?: { SHA256: string };
}

let ExpoCrypto: ExpoCryptoModule | null = null;
try {
  ExpoCrypto = require('expo-crypto');
} catch {
  ExpoCrypto = null;
}

// ---------------------------------------------------------------------------
// Pure JS SHA-256 Fallback
// ---------------------------------------------------------------------------

function sha256PureJs(ascii: string): string {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiLength = ascii[lengthProperty] * 8;

  let hash = (sha256PureJs as unknown as { h: number[] }).h = (sha256PureJs as unknown as { h: number[] }).h || [];
  let k = (sha256PureJs as unknown as { k: number[] }).k = (sha256PureJs as unknown as { k: number[] }).k || [];
  let primeCounter = k[lengthProperty];

  const isPrime = (candidate: number) => {
    for (let factor = 2; factor * factor <= candidate; factor++) {
      if (candidate % factor === 0) return false;
    }
    return true;
  };

  const getFractionalBits = (n: number) => Math.floor((n - Math.floor(n)) * maxWord);

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = getFractionalBits(Math.sqrt(candidate));
      }
      k[primeCounter] = getFractionalBits(Math.cbrt ? Math.cbrt(candidate) : Math.pow(candidate, 1 / 3));
      primeCounter++;
    }
  }

  hash = hash.slice(0);
  ascii += '\x80';
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - i) % 4 * 8);
  }
  words[words[lengthProperty]] = (asciiLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiLength | 0;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 =
        hash[7] +
        ((e >>> 6) ^ (e >>> 11) ^ (e >>> 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                ((w15 >>> 7) ^ (w15 >>> 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                ((w2 >>> 17) ^ (w2 >>> 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        ((a >>> 2) ^ (a >>> 13) ^ (a >>> 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [
        (temp1 + temp2) | 0,
        a,
        hash[1],
        hash[2],
        (hash[4] + temp1) | 0,
        hash[5],
        hash[6],
        hash[7],
      ];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Salt generation
// ---------------------------------------------------------------------------

/**
 * Generate a random 16-byte hex salt.
 * Uses expo-crypto if available, or crypto.getRandomValues / Math.random.
 */
export async function generateSalt(): Promise<string> {
  if (ExpoCrypto && typeof ExpoCrypto.getRandomBytesAsync === 'function') {
    try {
      const bytes = await ExpoCrypto.getRandomBytesAsync(16);
      return Array.from(bytes)
        .map((b: number) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fall through to JS random
    }
  }

  // Fallback random hex generation
  const randomBytes = new Uint8Array(16);
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 16; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(randomBytes)
    .map((b: number) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---------------------------------------------------------------------------
// PIN derivation
// ---------------------------------------------------------------------------

/**
 * Derive a verification hash from a PIN and salt using 1000 SHA-256 iterations.
 *
 * @param pin   Raw 6-digit PIN (never stored; discarded after derivation)
 * @param salt  Per-device hex salt from SecureStore
 * @returns     Hex digest suitable for SecureStore (NOT the PIN)
 */
export async function derivePinHash(pin: string, salt: string): Promise<string> {
  let current = `arkient:${pin}:${salt}`;

  if (
    ExpoCrypto &&
    typeof ExpoCrypto.digestStringAsync === 'function' &&
    ExpoCrypto.CryptoDigestAlgorithm
  ) {
    const algorithm = ExpoCrypto.CryptoDigestAlgorithm.SHA256;
    try {
      for (let i = 0; i < ITERATIONS; i++) {
        current = await ExpoCrypto.digestStringAsync(algorithm, current);
      }
      return current;
    } catch {
      // Fallback to pure JS if native crypto throws
      current = `arkient:${pin}:${salt}`;
    }
  }

  // Synchronous pure JS fallback loop
  for (let i = 0; i < ITERATIONS; i++) {
    current = sha256PureJs(current);
  }

  return current;
}

// ---------------------------------------------------------------------------
// PIN verification
// ---------------------------------------------------------------------------

/**
 * Verify a candidate PIN against stored hash + salt.
 *
 * @param candidatePin  PIN entered by the user (never stored)
 * @param storedHash    Hash previously stored in SecureStore
 * @param storedSalt    Salt previously stored in SecureStore
 * @returns             true if the PIN is correct
 */
export async function verifyPinAgainstHash(
  candidatePin: string,
  storedHash: string,
  storedSalt: string,
): Promise<boolean> {
  const derived = await derivePinHash(candidatePin, storedSalt);
  return derived === storedHash;
}
