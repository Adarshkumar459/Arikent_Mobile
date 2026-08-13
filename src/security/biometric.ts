/**
 * security/biometric.ts — expo-local-authentication wrapper.
 *
 * SECURITY RULES (enforced by this module):
 * - We NEVER store fingerprint, Face ID, iris, or any biometric template.
 * - We NEVER send biometric data to the backend.
 * - Biometric authentication is entirely handled by the device OS.
 * - expo-local-authentication returns only a boolean success/failure result.
 * - The OS manages all biometric matching internally.
 *
 * disableDeviceFallback: true is intentional.
 * We provide our own PIN fallback rather than delegating to the OS PIN/pattern,
 * which ensures a consistent UX and keeps App Lock separate from device unlock.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { BiometricAvailability } from './types';

// ---------------------------------------------------------------------------
// Availability check
// ---------------------------------------------------------------------------

/**
 * Check whether the device supports biometric authentication and
 * whether credentials are currently enrolled.
 *
 * Never throws — returns a safe fallback on any error.
 */
export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();

    if (!hasHardware) {
      return {
        available: false,
        hasHardware: false,
        enrolled: false,
        supportedTypes: [],
      };
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    const typeNames = supportedTypes.map((t) => {
      switch (t) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'face';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'iris';
        default:
          return 'unknown';
      }
    });

    return {
      available: isEnrolled,     // usable = hardware + enrolled
      hasHardware: true,
      enrolled: isEnrolled,
      supportedTypes: typeNames,
    };
  } catch {
    // Hardware check failed — treat as unavailable
    return {
      available: false,
      hasHardware: false,
      enrolled: false,
      supportedTypes: [],
    };
  }
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export interface BiometricAuthResult {
  success: boolean;
  cancelled: boolean;
  /**
   * True when the OS reports that biometric enrollment has changed
   * since the app last used biometrics (e.g., new fingerprint added,
   * Face ID re-enrolled, or all biometrics removed).
   * The app should require PIN fallback in this case.
   */
  enrollmentChanged: boolean;
  errorCode?: string;
}

/**
 * Request biometric authentication from the OS.
 *
 * @param reason  Prompt message shown to the user (e.g., "Unlock ARKIENT")
 */
export async function authenticateWithBiometrics(
  reason: string,
): Promise<BiometricAuthResult> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: true, // We handle PIN ourselves
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      return { success: true, cancelled: false, enrollmentChanged: false };
    }

    // result is { success: false; error: string; warning?: string }
    const errorCode = result.error;

    // Detect enrollment changes:
    // Android: 'not_enrolled'
    // iOS:     'LAErrorBiometryNotEnrolled', 'biometricChanged'
    const enrollmentChanged =
      errorCode === 'not_enrolled' ||
      errorCode === 'biometricChanged' ||
      errorCode === 'LAErrorBiometryNotEnrolled' ||
      errorCode === 'LAErrorPasscodeNotSet';

    const cancelled =
      errorCode === 'user_cancel' ||
      errorCode === 'system_cancel' ||
      errorCode === 'app_cancel';

    return {
      success: false,
      cancelled,
      enrollmentChanged,
      errorCode,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : undefined;
    return {
      success: false,
      cancelled: false,
      enrollmentChanged: false,
      errorCode: message,
    };
  }
}
