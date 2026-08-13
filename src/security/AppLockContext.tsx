/**
 * security/AppLockContext.tsx — App Lock state machine and provider.
 *
 * Responsibilities:
 * 1. Load App Lock configuration from SecureStore on startup.
 * 2. Maintain a strict state machine (LOADING → LOCKED/UNLOCKED/DISABLED/ERROR).
 * 3. Subscribe to AppState for auto-lock timeout handling.
 * 4. Provide unlock, setup, PIN management, and biometric settings functions.
 * 5. Detect logout (via AuthContext) and reset lock state appropriately.
 *
 * PRODUCT DECISION SCOPING:
 * - PIN is mandatory base protection (pinConfigured).
 * - Biometric is optional (biometricEnabled).
 * - Auto-lock timeout is independent.
 * - Lock screen only triggers biometric if biometricEnabled === true AND hardware available.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  LockState,
  AppLockSettings,
  BiometricAvailability,
  AutoLockTimeout,
  AppLockContextType,
} from './types';
import { lockStorage, DEFAULT_SETTINGS } from './lockStorage';
import {
  checkBiometricAvailability,
  authenticateWithBiometrics,
} from './biometric';
import { generateSalt, derivePinHash, verifyPinAgainstHash } from './pinUtils';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AppLockProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  const [lockState, setLockState] = useState<LockState>('LOADING');
  const [settings, setSettings] = useState<AppLockSettings>(DEFAULT_SETTINGS);
  const [biometricAvailability, setBiometricAvailability] =
    useState<BiometricAvailability | null>(null);

  // ── Refs for stable AppState & callbacks ──────────────────────────────────
  const lockStateRef = useRef<LockState>('LOADING');
  const settingsRef = useRef<AppLockSettings>(DEFAULT_SETTINGS);
  const backgroundedAtRef = useRef<number | null>(null);
  const userIdRef = useRef<string | undefined>(userId);

  lockStateRef.current = lockState;
  settingsRef.current = settings;
  userIdRef.current = userId;

  // ── Biometric availability (loaded on mount) ─────────────────────────────

  const refreshBiometricAvailability = useCallback(async () => {
    try {
      const avail = await checkBiometricAvailability();
      setBiometricAvailability(avail);
      return avail;
    } catch {
      const fallback: BiometricAvailability = {
        available: false,
        hasHardware: false,
        enrolled: false,
        supportedTypes: [],
      };
      setBiometricAvailability(fallback);
      return fallback;
    }
  }, []);

  useEffect(() => {
    refreshBiometricAvailability();
  }, [refreshBiometricAvailability]);

  const isInitialMountRef = useRef(true);

  // ── Load App Lock state from SecureStore ─────────────────────────────────

  const loadLockState = useCallback(async (currentUserId?: string, isColdStart: boolean = false) => {
    const targetUserId = currentUserId || userIdRef.current;
    if (!targetUserId) {
      setSettings(DEFAULT_SETTINGS);
      setLockState('DISABLED');
      return;
    }

    setLockState('LOADING');
    try {
      const savedSettings = await lockStorage.getSettings(targetUserId);

      if (savedSettings === null || !savedSettings.pinConfigured) {
        // First run or no PIN configured for this user → App Lock is off
        setSettings(DEFAULT_SETTINGS);
        setLockState('DISABLED');
        return;
      }

      setSettings(savedSettings);

      if (!savedSettings.enabled) {
        setLockState('DISABLED');
        return;
      }

      // App Lock is marked enabled — validate PIN material integrity for this user
      const pinMaterial = await lockStorage.getPinMaterial(targetUserId);
      if (!pinMaterial) {
        // Inconsistent state: enabled=true but no PIN material. FAIL CLOSED.
        setLockState('ERROR');
        return;
      }

      // App Lock is enabled & valid:
      // If cold start (app launch), lock immediately.
      // If fresh login (user just entered password), start UNLOCKED for this session.
      if (isColdStart) {
        setLockState('LOCKED');
      } else {
        setLockState('UNLOCKED');
      }
    } catch {
      // SecureStore error → FAIL CLOSED
      setLockState('ERROR');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && userId) {
      const isColdStart = isInitialMountRef.current;
      isInitialMountRef.current = false;
      loadLockState(userId, isColdStart);
    } else {
      setLockState('DISABLED');
      setSettings(DEFAULT_SETTINGS);
      backgroundedAtRef.current = null;
    }
  }, [isAuthenticated, userId, loadLockState]);

  // ── AppState subscription for auto-lock ─────────────────────────────────

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      const current = lockStateRef.current;

      // Ignore transitions while biometric dialog is open
      if (current === 'AUTHENTICATING') return;

      if (
        current === 'DISABLED' ||
        current === 'ERROR' ||
        current === 'LOADING'
      ) {
        return;
      }

      if (nextState === 'background' || nextState === 'inactive') {
        if (backgroundedAtRef.current === null && current !== 'LOCKED') {
          backgroundedAtRef.current = Date.now();
        }
        return;
      }

      if (nextState === 'active') {
        if (current === 'LOCKED') return;

        const backgroundedAt = backgroundedAtRef.current;
        backgroundedAtRef.current = null;

        if (backgroundedAt !== null) {
          const elapsed = Date.now() - backgroundedAt;
          const timeoutSeconds = settingsRef.current.timeout;

          if (timeoutSeconds === 0 || elapsed >= timeoutSeconds * 1000) {
            setLockState('LOCKED');
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // ── Biometric unlock ─────────────────────────────────────────────────────

  const unlockWithBiometric = useCallback(async (): Promise<{
    enrollmentChanged: boolean;
  }> => {
    setLockState('AUTHENTICATING');
    try {
      const result = await authenticateWithBiometrics('Unlock ARKIENT');

      if (result.success) {
        setLockState('UNLOCKED');
        return { enrollmentChanged: false };
      }

      setLockState('LOCKED');
      return { enrollmentChanged: result.enrollmentChanged };
    } catch {
      setLockState('LOCKED');
      return { enrollmentChanged: false };
    }
  }, []);

  // ── PIN management ───────────────────────────────────────────────────────

  const setupPin = useCallback(async (pin: string): Promise<void> => {
    const salt = await generateSalt();
    const hash = await derivePinHash(pin, salt);
    await lockStorage.savePinMaterial(hash, salt, userIdRef.current);
  }, []);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    const material = await lockStorage.getPinMaterial(userIdRef.current);
    if (!material) return false;
    return verifyPinAgainstHash(pin, material.hash, material.salt);
  }, []);

  const changePin = useCallback(
    async (currentPin: string, newPin: string): Promise<boolean> => {
      const isCorrect = await verifyPin(currentPin);
      if (!isCorrect) return false;

      await setupPin(newPin);
      return true;
    },
    [verifyPin, setupPin],
  );

  const clearPin = useCallback(async (): Promise<void> => {
    await lockStorage.clearPinMaterial(userIdRef.current);
  }, []);

  // ── PIN unlock ───────────────────────────────────────────────────────────

  const unlockWithPin = useCallback(
    async (pin: string): Promise<boolean> => {
      const correct = await verifyPin(pin);
      if (correct) {
        setLockState('UNLOCKED');
      }
      return correct;
    },
    [verifyPin],
  );

  // ── Lock management & settings ───────────────────────────────────────────

  const triggerLock = useCallback(() => {
    if (lockStateRef.current !== 'DISABLED') {
      setLockState('LOCKED');
    }
  }, []);

  /**
   * Complete PIN setup and enable App Lock. Biometric is OFF by default (#4).
   */
  const enableAppLockWithPin = useCallback(
    async (pin: string, timeout: AutoLockTimeout = 0): Promise<void> => {
      await setupPin(pin);
      const newSettings: AppLockSettings = {
        enabled: true,
        pinConfigured: true,
        biometricEnabled: false, // Biometric OFF by default
        timeout,
      };
      await lockStorage.saveSettings(newSettings, userIdRef.current);
      setSettings(newSettings);
      setLockState('UNLOCKED');
    },
    [setupPin],
  );

  /**
   * Toggle biometric ON or OFF (#5).
   * Turning ON verifies hardware & triggers OS prompt before enabling.
   */
  const setBiometricEnabled = useCallback(
    async (
      enabled: boolean,
    ): Promise<{ success: boolean; reason?: string }> => {
      if (!enabled) {
        const updated = { ...settingsRef.current, biometricEnabled: false };
        await lockStorage.saveSettings(updated, userIdRef.current);
        setSettings(updated);
        return { success: true };
      }

      // Check hardware & enrollment first
      const avail = await refreshBiometricAvailability();
      if (!avail.hasHardware) {
        return {
          success: false,
          reason: 'Biometric hardware is not supported on this device.',
        };
      }
      if (!avail.enrolled) {
        return {
          success: false,
          reason: 'No fingerprint or Face ID enrolled on this device. Set up biometrics in OS Settings.',
        };
      }

      // Trigger OS prompt to authenticate before enabling
      setLockState('AUTHENTICATING');
      try {
        const result = await authenticateWithBiometrics(
          'Confirm Face ID / Fingerprint for ARKIENT',
        );

        if (result.success) {
          const updated = { ...settingsRef.current, biometricEnabled: true };
          await lockStorage.saveSettings(updated, userIdRef.current);
          setSettings(updated);
          setLockState('UNLOCKED');
          return { success: true };
        } else {
          setLockState('UNLOCKED');
          return {
            success: false,
            reason: result.cancelled
              ? 'Authentication cancelled.'
              : 'Biometric authentication failed.',
          };
        }
      } catch {
        setLockState('UNLOCKED');
        return { success: false, reason: 'Biometric authentication error.' };
      }
    },
    [refreshBiometricAvailability],
  );

  /**
   * Update auto-lock timeout preference (#11).
   */
  const updateTimeout = useCallback(
    async (newTimeout: AutoLockTimeout): Promise<void> => {
      const updated = { ...settingsRef.current, timeout: newTimeout };
      await lockStorage.saveSettings(updated, userIdRef.current);
      setSettings(updated);
    },
    [],
  );

  /**
   * Disable App Lock (#12).
   */
  const disableAppLock = useCallback(async (): Promise<void> => {
    await lockStorage.clearAll(userIdRef.current);
    setSettings(DEFAULT_SETTINGS);
    setLockState('DISABLED');
  }, []);

  const retryLoadState = useCallback(async (): Promise<void> => {
    await loadLockState(userIdRef.current);
  }, [loadLockState]);

  return (
    <AppLockContext.Provider
      value={{
        lockState,
        settings,
        biometricAvailability,
        setupPin,
        changePin,
        verifyPin,
        clearPin,
        unlockWithBiometric,
        unlockWithPin,
        triggerLock,
        enableAppLockWithPin,
        setBiometricEnabled,
        updateTimeout,
        disableAppLock,
        retryLoadState,
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
};

export const useAppLock = (): AppLockContextType => {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLock must be used within an AppLockProvider');
  }
  return context;
};
