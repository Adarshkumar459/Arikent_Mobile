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
// Storage keys (secureStore adds arkient_sec_ prefix automatically)
// ---------------------------------------------------------------------------

const KEYS = {
  ENABLED: 'lock_enabled',
  PIN_CONFIGURED: 'pin_configured',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  TIMEOUT: 'lock_timeout',
  PIN_HASH: 'pin_hash',
  PIN_SALT: 'pin_salt',
  // Legacy key for migration
  LEGACY_METHOD: 'lock_method',
} as const;

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
   * Read all App Lock settings from SecureStore with automatic legacy migration.
   *
   * Returns null  — no settings configured yet.
   * Returns object — the current settings.
   */
  async getSettings(): Promise<AppLockSettings | null> {
    const enabledRaw = await secureStore.getItem(KEYS.ENABLED);
    let pinConfiguredRaw = await secureStore.getItem(KEYS.PIN_CONFIGURED);
    let biometricEnabledRaw = await secureStore.getItem(KEYS.BIOMETRIC_ENABLED);

    const hash = await secureStore.getItem(KEYS.PIN_HASH);
    const salt = await secureStore.getItem(KEYS.PIN_SALT);

    // ── MIGRATION LOGIC FOR LEGACY INSTALLATIONS (#13) ──────────────────────
    if (pinConfiguredRaw === null) {
      if (hash && salt) {
        // Legacy installation detected: pin_hash exists
        pinConfiguredRaw = 'true';
        const legacyMethod = await secureStore.getItem(KEYS.LEGACY_METHOD);
        biometricEnabledRaw = legacyMethod === 'biometric_pin' ? 'true' : 'false';

        // Persist migrated keys
        await secureStore.setItem(KEYS.PIN_CONFIGURED, pinConfiguredRaw);
        await secureStore.setItem(KEYS.BIOMETRIC_ENABLED, biometricEnabledRaw);
      } else {
        // First run: no lock configured
        return null;
      }
    }

    const timeoutRaw = await secureStore.getItem(KEYS.TIMEOUT);
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
   * Write App Lock settings to SecureStore.
   */
  async saveSettings(settings: AppLockSettings): Promise<void> {
    await secureStore.setItem(KEYS.ENABLED, settings.enabled ? 'true' : 'false');
    await secureStore.setItem(KEYS.PIN_CONFIGURED, settings.pinConfigured ? 'true' : 'false');
    await secureStore.setItem(KEYS.BIOMETRIC_ENABLED, settings.biometricEnabled ? 'true' : 'false');
    await secureStore.setItem(KEYS.TIMEOUT, String(settings.timeout));
  },

  /**
   * Read PIN verification material (derived hash + salt).
   */
  async getPinMaterial(): Promise<{ hash: string; salt: string } | null> {
    const hash = await secureStore.getItem(KEYS.PIN_HASH);
    const salt = await secureStore.getItem(KEYS.PIN_SALT);
    if (!hash || !salt) return null;
    return { hash, salt };
  },

  /**
   * Write PIN verification material.
   * ONLY the derived hash and salt are stored — never the raw PIN.
   */
  async savePinMaterial(hash: string, salt: string): Promise<void> {
    await secureStore.setItem(KEYS.PIN_HASH, hash);
    await secureStore.setItem(KEYS.PIN_SALT, salt);
    await secureStore.setItem(KEYS.PIN_CONFIGURED, 'true');
  },

  /**
   * Delete PIN verification material from SecureStore.
   */
  async clearPinMaterial(): Promise<void> {
    await secureStore.removeItem(KEYS.PIN_HASH);
    await secureStore.removeItem(KEYS.PIN_SALT);
    await secureStore.removeItem(KEYS.PIN_CONFIGURED);
  },

  /**
   * Delete ALL App Lock data from SecureStore.
   */
  async clearAll(): Promise<void> {
    await secureStore.removeItem(KEYS.ENABLED);
    await secureStore.removeItem(KEYS.PIN_CONFIGURED);
    await secureStore.removeItem(KEYS.BIOMETRIC_ENABLED);
    await secureStore.removeItem(KEYS.TIMEOUT);
    await secureStore.removeItem(KEYS.PIN_HASH);
    await secureStore.removeItem(KEYS.PIN_SALT);
    await secureStore.removeItem(KEYS.LEGACY_METHOD);
  },
};
