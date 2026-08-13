/**
 * security/AppLockScreen.tsx — Full-screen authentication gate UI.
 *
 * PRODUCT RULES (#8, #9, #10):
 * - If biometricEnabled === false:
 *     Renders ONLY PIN UI. NEVER calls LocalAuthentication.authenticateAsync() automatically.
 * - If biometricEnabled === true AND device has enrolled biometrics:
 *     Renders Biometric prompt as primary, PIN as fallback.
 *     Auto-triggers OS biometric prompt on mount once.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppLock } from './AppLockContext';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, radius, elevation } from '../theme';
import { useCustomAlert } from '../components/alerts/CustomAlert';

// ---------------------------------------------------------------------------
// PIN attempt throttling constants
// ---------------------------------------------------------------------------

const FREE_ATTEMPTS = 3;

function getThrottleMs(attemptNumber: number): number {
  if (attemptNumber <= FREE_ATTEMPTS) return 0;
  if (attemptNumber === 4) return 5_000;
  if (attemptNumber === 5) return 15_000;
  return 30_000; // 6+
}

const NUMPAD_ROWS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

// ---------------------------------------------------------------------------
// PinEntryView — inline child component
// ---------------------------------------------------------------------------

interface PinEntryViewProps {
  onForgotPin: () => void;
  onUseBiometric?: () => void;
  showBiometricOption: boolean;
}

const PinEntryView: React.FC<PinEntryViewProps> = ({
  onForgotPin,
  onUseBiometric,
  showBiometricOption,
}) => {
  const { unlockWithPin } = useAppLock();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [throttleUntilMs, setThrottleUntilMs] = useState(0);
  const [throttleRemaining, setThrottleRemaining] = useState(0);
  const attemptCountRef = useRef(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (throttleUntilMs === 0) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((throttleUntilMs - Date.now()) / 1000));
      setThrottleRemaining(remaining);
      if (remaining === 0) {
        setThrottleUntilMs(0);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [throttleUntilMs]);

  const shake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const isThrottled = Date.now() < throttleUntilMs;
  const isDisabled = isVerifying || isThrottled;

  const handleDigit = useCallback(
    async (digit: string) => {
      if (isDisabled) return;
      if (pin.length >= 6) return;

      const newPin = pin + digit;
      setPin(newPin);
      setError('');

      if (newPin.length === 6) {
        setIsVerifying(true);
        try {
          const correct = await unlockWithPin(newPin);
          if (correct) {
            return;
          }
          attemptCountRef.current += 1;
          const delay = getThrottleMs(attemptCountRef.current);

          if (delay > 0) {
            const until = Date.now() + delay;
            setThrottleUntilMs(until);
            setThrottleRemaining(Math.ceil(delay / 1000));
            setError(`Too many attempts. Wait ${Math.ceil(delay / 1000)}s.`);
          } else {
            setError('Incorrect PIN. Try again.');
          }
          shake();
          setPin('');
        } catch {
          setError('An error occurred. Please try again.');
          setPin('');
        } finally {
          setIsVerifying(false);
        }
      }
    },
    [pin, isDisabled, unlockWithPin, shake],
  );

  const handleDelete = useCallback(() => {
    if (isDisabled) return;
    setPin((p) => p.slice(0, -1));
    setError('');
  }, [isDisabled]);

  return (
    <View style={pinStyles.container}>
      <Text style={pinStyles.label}>Enter PIN</Text>

      <Animated.View
        style={[
          pinStyles.dotsRow,
          { transform: [{ translateX: shakeAnim }] },
        ]}
        accessible={true}
        accessibilityLabel={`PIN entry: ${pin.length} of 6 digits entered`}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              pinStyles.dot,
              i < pin.length && pinStyles.dotFilled,
              !!error && pinStyles.dotError,
            ]}
          />
        ))}
      </Animated.View>

      {!!error ? (
        <Text style={pinStyles.errorText} accessible={true} accessibilityRole="alert">
          {error}
        </Text>
      ) : isThrottled && throttleRemaining > 0 ? (
        <Text style={pinStyles.errorText} accessible={true} accessibilityRole="alert">
          Wait {throttleRemaining}s…
        </Text>
      ) : (
        <View style={pinStyles.errorPlaceholder} />
      )}

      <View style={pinStyles.numpad}>
        {NUMPAD_ROWS.map((row, rowIdx) => (
          <View key={rowIdx} style={pinStyles.numpadRow}>
            {row.map((key, keyIdx) => {
              if (key === '') {
                return <View key={`empty-${rowIdx}-${keyIdx}`} style={pinStyles.numpadKey} />;
              }
              if (key === '⌫') {
                return (
                  <TouchableOpacity
                    key="delete"
                    style={[pinStyles.numpadKey, pinStyles.numpadKeyAction]}
                    onPress={handleDelete}
                    disabled={isDisabled || pin.length === 0}
                    accessible={true}
                    accessibilityLabel="Delete last digit"
                    accessibilityRole="button"
                    activeOpacity={0.7}
                  >
                    <Text style={pinStyles.numpadDeleteText}>⌫</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    pinStyles.numpadKey,
                    pinStyles.numpadKeyDigit,
                    isDisabled && pinStyles.numpadKeyDisabled,
                  ]}
                  onPress={() => handleDigit(key)}
                  disabled={isDisabled || pin.length >= 6}
                  accessible={true}
                  accessibilityLabel={`Digit ${key}`}
                  accessibilityRole="button"
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      pinStyles.numpadDigitText,
                      isDisabled && pinStyles.numpadDigitDisabled,
                    ]}
                  >
                    {isVerifying && pin.length === 6 ? '…' : key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Styled Modern Action Pill Buttons */}
      <View style={pinStyles.actionsRow}>
        {showBiometricOption && onUseBiometric && (
          <TouchableOpacity
            onPress={onUseBiometric}
            style={pinStyles.biometricPillBtn}
            accessible={true}
            accessibilityLabel="Switch to biometric authentication"
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text style={pinStyles.biometricPillIcon}>👆</Text>
            <Text style={pinStyles.biometricPillText}>Use Biometric</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onForgotPin}
          style={pinStyles.forgotPillBtn}
          accessible={true}
          accessibilityLabel="Forgot PIN — recover account access"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={pinStyles.forgotPillIcon}>🔑</Text>
          <Text style={pinStyles.forgotPillText}>Forgot PIN?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// AppLockScreen
// ---------------------------------------------------------------------------

export const AppLockScreen: React.FC = () => {
  const {
    lockState,
    settings,
    biometricAvailability,
    unlockWithBiometric,
    disableAppLock,
    retryLoadState,
  } = useAppLock();
  const { logout } = useAuth();
  const { showAlert, CustomAlertModal } = useCustomAlert();
  const insets = useSafeAreaInsets();

  const topPad = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0,
  );

  const isBiometricActive =
    settings.biometricEnabled === true &&
    biometricAvailability?.available === true;

  const [showPin, setShowPin] = useState(!isBiometricActive);
  const [enrollmentChangedWarning, setEnrollmentChangedWarning] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  const hasAutoTriggered = useRef(false);
  const disableAppLockRef = useRef(disableAppLock);
  disableAppLockRef.current = disableAppLock;

  const handleBiometric = useCallback(async () => {
    if (!isBiometricActive) return;

    setIsBiometricLoading(true);
    setEnrollmentChangedWarning(false);
    try {
      const { enrollmentChanged } = await unlockWithBiometric();
      if (enrollmentChanged) {
        setEnrollmentChangedWarning(true);
        setShowPin(true);
      }
    } finally {
      setIsBiometricLoading(false);
    }
  }, [isBiometricActive, unlockWithBiometric]);

  useEffect(() => {
    if (
      lockState === 'LOCKED' &&
      isBiometricActive &&
      !hasAutoTriggered.current &&
      !showPin
    ) {
      hasAutoTriggered.current = true;
      handleBiometric();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleForgotPin = useCallback(() => {
    showAlert(
      'Forgot PIN?',
      'To bypass the lock screen, please log in to your account again with your password.',
      'warning',
      [
        { text: 'Cancel', variant: 'secondary' },
        {
          text: 'Log In Again',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  }, [logout, showAlert]);

  if (lockState === 'ERROR') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={[styles.content, { paddingTop: topPad + spacing.xl }]}>
          <View style={styles.iconRingDanger}>
            <Text style={styles.lockIcon} accessible={false}>⚠️</Text>
          </View>
          <Text style={styles.title}>Security Error</Text>
          <Text style={styles.subtitle}>
            App Lock settings could not be loaded. Access is restricted until the issue is resolved.
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={retryLoadState}
            accessible={true}
            accessibilityLabel="Try loading App Lock settings again"
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() =>
              showAlert(
                'Reset App Lock',
                'This will log you out and disable App Lock. Your account data is not affected.',
                'warning',
                [
                  { text: 'Cancel', variant: 'secondary' },
                  {
                    text: 'Log Out & Reset',
                    onPress: logout,
                  },
                ],
              )
            }
            accessible={true}
            accessibilityLabel="Log out and reset App Lock"
            accessibilityRole="button"
          >
            <Text style={styles.dangerBtnText}>Log Out & Reset</Text>
          </TouchableOpacity>
        </View>
        <CustomAlertModal />
      </SafeAreaView>
    );
  }

  const biometricLabel = 'Use Biometric';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={[styles.content, { paddingTop: topPad + spacing.xl }]}>
        {/* Brand Tag */}
        <View style={styles.brandTag}>
          <Text style={styles.brandTagText}>ARKIENT SECURITY</Text>
        </View>

        {/* Polished Icon Badge */}
        <View style={styles.iconBadgeContainer}>
          <View style={styles.iconBadgeGlow} />
          <View style={styles.iconBadgeInner}>
            <Text style={styles.lockEmoji} accessible={false}>🔐</Text>
          </View>
        </View>

        <Text style={styles.title}>Unlock ARKIENT</Text>
        <Text style={styles.subtitle}>Authenticate to access your workspace</Text>

        {enrollmentChangedWarning && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText} accessibilityRole="alert">
              Biometric enrollment has changed. Please use your PIN to unlock.
            </Text>
          </View>
        )}

        {!isBiometricActive || showPin ? (
          <PinEntryView
            onForgotPin={handleForgotPin}
            onUseBiometric={
              isBiometricActive && !enrollmentChangedWarning
                ? () => {
                    setShowPin(false);
                    handleBiometric();
                  }
                : undefined
            }
            showBiometricOption={isBiometricActive && !enrollmentChangedWarning}
          />
        ) : (
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={[styles.primaryBtn, isBiometricLoading && styles.btnLoading]}
              onPress={handleBiometric}
              disabled={isBiometricLoading}
              accessible={true}
              accessibilityLabel="Authenticate with biometrics to unlock ARKIENT"
              accessibilityRole="button"
              activeOpacity={0.85}
            >
              {isBiometricLoading ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <View style={styles.btnContentRow}>
                  <Text style={styles.btnIcon}>👆</Text>
                  <Text style={styles.primaryBtnText}>{biometricLabel}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setShowPin(true)}
              accessible={true}
              accessibilityLabel="Use PIN to unlock ARKIENT"
              accessibilityRole="button"
              activeOpacity={0.85}
            >
              <View style={styles.btnContentRow}>
                <Text style={styles.btnIconSec}>🔢</Text>
                <Text style={styles.secondaryBtnText}>Use PIN</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <CustomAlertModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  brandTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.xl,
  },
  brandTagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  iconBadgeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconBadgeGlow: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
  iconBadgeInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...elevation.small,
  },
  lockEmoji: {
    fontSize: 42,
  },
  iconRingDanger: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  lockIcon: {
    fontSize: 36,
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  warningCard: {
    backgroundColor: colors.warningBackground,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning,
    textAlign: 'center',
  },
  authButtons: {
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...elevation.small,
  },
  btnLoading: {
    opacity: 0.75,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  btnIcon: {
    fontSize: 18,
  },
  btnIconSec: {
    fontSize: 18,
  },
  primaryBtnText: {
    ...typography.button,
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...elevation.small,
  },
  secondaryBtnText: {
    ...typography.button,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  dangerBtn: {
    width: '100%',
    backgroundColor: colors.transparent,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.error,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 56,
  },
  dangerBtnText: {
    ...typography.button,
    color: colors.error,
    fontWeight: '600',
  },
});

const pinStyles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.transparent,
  },
  dotFilled: {
    backgroundColor: colors.primary,
    ...elevation.small,
  },
  dotError: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    height: 18,
    marginBottom: spacing.md,
  },
  errorPlaceholder: {
    height: 18,
    marginBottom: spacing.md,
  },
  numpad: {
    width: '100%',
    gap: spacing.xs + 2,
    marginBottom: spacing.lg,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  numpadKey: {
    width: 76,
    height: 60,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadKeyDigit: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  numpadKeyAction: {
    backgroundColor: colors.surfaceContainer,
  },
  numpadKeyDisabled: {
    opacity: 0.4,
  },
  numpadDigitText: {
    ...typography.heading3,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  numpadDigitDisabled: {
    color: colors.textDisabled,
  },
  numpadDeleteText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  biometricPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  biometricPillIcon: {
    fontSize: 14,
  },
  biometricPillText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  forgotPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.small,
  },
  forgotPillIcon: {
    fontSize: 14,
  },
  forgotPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
