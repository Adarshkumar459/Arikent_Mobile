/**
 * security/lockStorage.ts — Typed SecureStore wrapper for App Lock data.
 *
 * This is a thin, typed wrapper over the existing `secureStore` singleton
 * from src/services/storage/secureStore.ts.
 *
 * STORAGE MODEL (INDEPENDENT STATE):
 * - lock_enabled       → 'true' | 'false'
 * - pin_configured     → 'true' | 'false'
 * - biometric_enabled   → 'true' | 'false'
 * - lock_timeout       → '0' | '60' | '300' | '900'
 * - pin_hash           → hex string (derived hash)
 * - pin_salt           → hex string (16-byte random salt)
 *
 * BACKWARD COMPATIBILITY / MIGRATION (#13):
 * Automatically migrates legacy `lock_method` keys ('biometric_pin' / 'pin')
 * to independent `pin_configured` and `biometric_enabled` flags without locking
 * out existing users.
 */

import { secureStore } from '../services/storage/secureStore';
import { AppLockSettings, AutoLockTimeout } from './types';

// ---------------------------------------------------------------------------
// Helper to construct user-scoped storage keys
// ---------------------------------------------------------------------------

const getKeys = (userId?: string) => {
  const prefix = userId ? `u_${userId}_` : '';
  return {
    ENABLED: `${prefix}lock_enabled`,
    PIN_CONFIGURED: `${prefix}pin_configured`,
    BIOMETRIC_ENABLED: `${prefix}biometric_enabled`,
    TIMEOUT: `${prefix}lock_timeout`,
    PIN_HASH: `${prefix}pin_hash`,
    PIN_SALT: `${prefix}pin_salt`,
    LEGACY_METHOD: `${prefix}lock_method`,
  };
};

const LEGACY_UNPREFIXED_KEYS = {
  ENABLED: 'lock_enabled',
  PIN_CONFIGURED: 'pin_configured',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  TIMEOUT: 'lock_timeout',
  PIN_HASH: 'pin_hash',
  PIN_SALT: 'pin_salt',
  LEGACY_METHOD: 'lock_method',
};

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_SETTINGS: AppLockSettings = {
  enabled: false,
  pinConfigured: false,
  biometricEnabled: false,
  timeout: 0,
};

const VALID_TIMEOUTS: AutoLockTimeout[] = [0, 60, 300, 900];

// ---------------------------------------------------------------------------
// lockStorage API
// ---------------------------------------------------------------------------

export const lockStorage = {
  /**
   * Read user-scoped App Lock settings from SecureStore with automatic legacy migration.
   */
  async getSettings(userId?: string): Promise<AppLockSettings | null> {
    const keys = getKeys(userId);
    let enabledRaw = await secureStore.getItem(keys.ENABLED);
    let pinConfiguredRaw = await secureStore.getItem(keys.PIN_CONFIGURED);
    let biometricEnabledRaw = await secureStore.getItem(keys.BIOMETRIC_ENABLED);

    let hash = await secureStore.getItem(keys.PIN_HASH);
    let salt = await secureStore.getItem(keys.PIN_SALT);

    // ── MIGRATION LOGIC FOR UN-PREFIXED LEGACY KEYS ────────────────────────
    if (userId && pinConfiguredRaw === null && hash === null) {
      const legacyHash = await secureStore.getItem(LEGACY_UNPREFIXED_KEYS.PIN_HASH);
      const legacySalt = await secureStore.getItem(LEGACY_UNPREFIXED_KEYS.PIN_SALT);

      if (legacyHash && legacySalt) {
        const legacyEnabled = await secureStore.getItem(LEGACY_UNPREFIXED_KEYS.ENABLED);
        const legacyBiometric = await secureStore.getItem(LEGACY_UNPREFIXED_KEYS.BIOMETRIC_ENABLED);
        const legacyTimeout = await secureStore.getItem(LEGACY_UNPREFIXED_KEYS.TIMEOUT);

        await secureStore.setItem(keys.ENABLED, legacyEnabled ?? 'false');
        await secureStore.setItem(keys.PIN_CONFIGURED, 'true');
        await secureStore.setItem(keys.BIOMETRIC_ENABLED, legacyBiometric ?? 'false');
        await secureStore.setItem(keys.TIMEOUT, legacyTimeout ?? '0');
        await secureStore.setItem(keys.PIN_HASH, legacyHash);
        await secureStore.setItem(keys.PIN_SALT, legacySalt);

        // Remove old un-prefixed keys
        await secureStore.removeItem(LEGACY_UNPREFIXED_KEYS.ENABLED);
        await secureStore.removeItem(LEGACY_UNPREFIXED_KEYS.PIN_CONFIGURED);
        await secureStore.removeItem(LEGACY_UNPREFIXED_KEYS.BIOMETRIC_ENABLED);
        await secureStore.removeItem(LEGACY_UNPREFIXED_KEYS.TIMEOUT);
        await secureStore.removeItem(LEGACY_UNPREFIXED_KEYS.PIN_HASH);
        await secureStore.removeItem(LEGACY_UNPREFIXED_KEYS.PIN_SALT);
        await secureStore.removeItem(LEGACY_UNPREFIXED_KEYS.LEGACY_METHOD);

        enabledRaw = legacyEnabled;
        pinConfiguredRaw = 'true';
        biometricEnabledRaw = legacyBiometric;
        hash = legacyHash;
        salt = legacySalt;
      }
    }

    if (pinConfiguredRaw === null) {
      if (hash && salt) {
        pinConfiguredRaw = 'true';
        const legacyMethod = await secureStore.getItem(keys.LEGACY_METHOD);
        biometricEnabledRaw = legacyMethod === 'biometric_pin' ? 'true' : 'false';

        await secureStore.setItem(keys.PIN_CONFIGURED, pinConfiguredRaw);
        await secureStore.setItem(keys.BIOMETRIC_ENABLED, biometricEnabledRaw);
      } else {
        return null;
      }
    }

    const timeoutRaw = await secureStore.getItem(keys.TIMEOUT);
    const parsedTimeout = parseInt(timeoutRaw ?? '0', 10);
    const safeTimeout: AutoLockTimeout = VALID_TIMEOUTS.includes(
      parsedTimeout as AutoLockTimeout,
    )
      ? (parsedTimeout as AutoLockTimeout)
      : 0;

    return {
      enabled: enabledRaw === 'true',
      pinConfigured: pinConfiguredRaw === 'true',
      biometricEnabled: biometricEnabledRaw === 'true',
      timeout: safeTimeout,
    };
  },

  /**
   * Write user-scoped App Lock settings to SecureStore.
   */
  async saveSettings(settings: AppLockSettings, userId?: string): Promise<void> {
    const keys = getKeys(userId);
    await secureStore.setItem(keys.ENABLED, settings.enabled ? 'true' : 'false');
    await secureStore.setItem(keys.PIN_CONFIGURED, settings.pinConfigured ? 'true' : 'false');
    await secureStore.setItem(keys.BIOMETRIC_ENABLED, settings.biometricEnabled ? 'true' : 'false');
    await secureStore.setItem(keys.TIMEOUT, String(settings.timeout));
  },

  /**
   * Read user-scoped PIN verification material (derived hash + salt).
   */
  async getPinMaterial(userId?: string): Promise<{ hash: string; salt: string } | null> {
    const keys = getKeys(userId);
    const hash = await secureStore.getItem(keys.PIN_HASH);
    const salt = await secureStore.getItem(keys.PIN_SALT);
    if (!hash || !salt) return null;
    return { hash, salt };
  },

  /**
   * Write user-scoped PIN verification material.
   */
  async savePinMaterial(hash: string, salt: string, userId?: string): Promise<void> {
    const keys = getKeys(userId);
    await secureStore.setItem(keys.PIN_HASH, hash);
    await secureStore.setItem(keys.PIN_SALT, salt);
    await secureStore.setItem(keys.PIN_CONFIGURED, 'true');
  },

  /**
   * Delete user-scoped PIN verification material from SecureStore.
   */
  async clearPinMaterial(userId?: string): Promise<void> {
    const keys = getKeys(userId);
    await secureStore.removeItem(keys.PIN_HASH);
    await secureStore.removeItem(keys.PIN_SALT);
    await secureStore.removeItem(keys.PIN_CONFIGURED);
  },

  /**
   * Delete ALL user-scoped App Lock data from SecureStore.
   */
  async clearAll(userId?: string): Promise<void> {
    const keys = getKeys(userId);
    await secureStore.removeItem(keys.ENABLED);
    await secureStore.removeItem(keys.PIN_CONFIGURED);
    await secureStore.removeItem(keys.BIOMETRIC_ENABLED);
    await secureStore.removeItem(keys.TIMEOUT);
    await secureStore.removeItem(keys.PIN_HASH);
    await secureStore.removeItem(keys.PIN_SALT);
    await secureStore.removeItem(keys.LEGACY_METHOD);
  },
};
