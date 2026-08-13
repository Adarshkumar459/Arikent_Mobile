/**
 * security/types.ts — Core type definitions for ARKIENT's security/lock system.
 *
 * FUTURE EXTENSIBILITY:
 * LockScope is defined for all planned lock features.
 * Currently ONLY 'APP' is implemented.
 * Future: 'NOTE' | 'FOLDER' | 'DOCUMENT' | 'VAULT' locks can be added
 * by extending the SecurityService without rewriting App Lock.
 */

// ---------------------------------------------------------------------------
// Lock Scope
// ---------------------------------------------------------------------------

/**
 * Defines the scope of a security lock.
 * Only 'APP' is currently implemented.
 */
export type LockScope = 'APP' | 'NOTE' | 'FOLDER' | 'DOCUMENT' | 'VAULT';

// ---------------------------------------------------------------------------
// App Lock State Machine
// ---------------------------------------------------------------------------

/**
 * App Lock state machine states.
 *
 * LOADING        — Startup: SecureStore is being read. Protected content is hidden.
 * ERROR          — SecureStore read failed or state is inconsistent. Fails CLOSED.
 * DISABLED       — App Lock is configured off. Gate passes through to content.
 * LOCKED         — App Lock is on. User must authenticate to proceed.
 * UNLOCKED       — App Lock is on. User has authenticated this session.
 * AUTHENTICATING — Biometric dialog is in progress. AppState transitions are ignored.
 * BACKGROUND     — App is in background. Timestamp recorded for timeout evaluation.
 */
export type LockState =
  | 'LOADING'
  | 'ERROR'
  | 'DISABLED'
  | 'LOCKED'
  | 'UNLOCKED'
  | 'AUTHENTICATING'
  | 'BACKGROUND';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Auto-lock timeout in seconds.
 * 0 = lock immediately on any background transition.
 */
export type AutoLockTimeout = 0 | 60 | 300 | 900;

export interface AppLockSettings {
  /** Master lock toggle */
  enabled: boolean;
  /** Whether 6-digit PIN has been set up (Mandatory base) */
  pinConfigured: boolean;
  /** Whether user explicitly toggled biometric ON (Optional) */
  biometricEnabled: boolean;
  /** Auto-lock timeout in seconds */
  timeout: AutoLockTimeout;
}

// ---------------------------------------------------------------------------
// Biometric
// ---------------------------------------------------------------------------

export interface BiometricAvailability {
  /** Hardware present AND credentials currently enrolled */
  available: boolean;
  /** Biometric hardware is present (regardless of enrollment) */
  hasHardware: boolean;
  /** Biometric credentials are currently enrolled */
  enrolled: boolean;
  /** Human-readable type names, e.g. ['fingerprint', 'face'] */
  supportedTypes: string[];
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface AppLockContextType {
  lockState: LockState;
  settings: AppLockSettings;
  biometricAvailability: BiometricAvailability | null;

  // ── PIN management ──────────────────────────────────────────────────────
  /** Derive and store PIN verification material. Raw PIN is never stored. */
  setupPin: (pin: string) => Promise<void>;
  /** Change PIN — requires current PIN verification first. */
  changePin: (currentPin: string, newPin: string) => Promise<boolean>;
  /** Verify a candidate PIN against stored material. */
  verifyPin: (pin: string) => Promise<boolean>;
  /** Remove PIN verification material from SecureStore. */
  clearPin: () => Promise<void>;

  // ── Unlock ──────────────────────────────────────────────────────────────
  /** Trigger OS biometric prompt. Returns whether enrollment has changed. */
  unlockWithBiometric: () => Promise<{ enrollmentChanged: boolean }>;
  /** Verify PIN and unlock if correct. Returns true on success. */
  unlockWithPin: (pin: string) => Promise<boolean>;

  // ── Lock management ─────────────────────────────────────────────────────
  /** Manually trigger lock (e.g. from a "Lock Now" action). */
  triggerLock: () => void;
  /**
   * Persist App Lock settings and set state to UNLOCKED / LOCKED after PIN setup.
   */
  enableAppLockWithPin: (pin: string, timeout?: AutoLockTimeout) => Promise<void>;
  /**
   * Enable/disable optional biometric setting.
   * Turning ON triggers OS biometric prompt and only succeeds if prompt passes.
   */
  setBiometricEnabled: (enabled: boolean) => Promise<{ success: boolean; reason?: string }>;
  /** Update auto-lock timeout preference */
  updateTimeout: (timeout: AutoLockTimeout) => Promise<void>;
  /**
   * Disable App Lock, clear PIN material & biometric setting, and set state to DISABLED.
   * Caller must verify the user's identity (biometric/PIN) before calling.
   */
  disableAppLock: () => Promise<void>;

  // ── Error recovery ───────────────────────────────────────────────────────
  /** Re-attempt loading App Lock state from SecureStore. */
  retryLoadState: () => Promise<void>;
}
