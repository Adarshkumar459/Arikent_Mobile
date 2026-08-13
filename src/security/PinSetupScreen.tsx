/**
 * security/PinSetupScreen.tsx — 6-digit PIN creation and change screen.
 *
 * Supports two modes:
 * - mode: 'setup' (default): Set 6-digit PIN → Confirm 6-digit PIN → Enable App Lock.
 * - mode: 'change': Enter Current PIN → Set New 6-digit PIN → Confirm New 6-digit PIN.
 *
 * SECURITY:
 * Raw PIN is passed only to AppLockContext methods (which pass to pinUtils.derivePinHash).
 * Raw PIN is never stored or logged.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/types/navigation.types';
import { useAppLock } from './AppLockContext';
import { colors, spacing, typography, radius } from '../theme';
import { ScreenHeader } from '../components/navigation/ScreenHeader';
import { useCustomAlert } from '../components/alerts/CustomAlert';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AppLockSetup'>;

type SetupStep = 'current' | 'enter' | 'confirm';

const NUMPAD_ROWS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export const PinSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { enableAppLockWithPin, changePin, verifyPin } = useAppLock();
  const { showAlert, CustomAlertModal } = useCustomAlert();
  const mode = route.params?.mode || 'setup';

  const [step, setStep] = useState<SetupStep>(mode === 'change' ? 'current' : 'enter');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

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

  const handleDigit = useCallback(
    async (digit: string) => {
      if (isProcessing) return;
      if (currentPin.length >= 6) return;

      const newPin = currentPin + digit;
      setCurrentPin(newPin);
      setError('');

      if (newPin.length === 6) {
        if (step === 'current') {
          // Verify current PIN before changing
          setIsProcessing(true);
          try {
            const isCorrect = await verifyPin(newPin);
            if (isCorrect) {
              setCurrentPinInput(newPin);
              setCurrentPin('');
              setStep('enter');
            } else {
              shake();
              setError('Incorrect current PIN. Try again.');
              setCurrentPin('');
            }
          } catch {
            setError('Verification error. Try again.');
            setCurrentPin('');
          } finally {
            setIsProcessing(false);
          }
          return;
        }

        if (step === 'enter') {
          setFirstPin(newPin);
          setCurrentPin('');
          setStep('confirm');
          return;
        }

        if (step === 'confirm') {
          if (newPin !== firstPin) {
            shake();
            setError('PINs do not match. Please start again.');
            setCurrentPin('');
            setFirstPin('');
            setStep(mode === 'change' ? 'current' : 'enter');
            return;
          }

          setIsProcessing(true);
          try {
            if (mode === 'change') {
              await changePin(currentPinInput, newPin);
              showAlert('Success', 'Your PIN has been changed successfully.', 'success', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } else {
              await enableAppLockWithPin(newPin);
              // Navigate directly to AppLockSettingsScreen after setup (#3, #4)
              navigation.replace('AppLockSettings');
            }
          } catch {
            shake();
            setError('Setup failed. Please try again.');
            setCurrentPin('');
            setFirstPin('');
            setStep('enter');
          } finally {
            setIsProcessing(false);
          }
        }
      }
    },
    [currentPin, step, firstPin, isProcessing, verifyPin, changePin, enableAppLockWithPin, mode, currentPinInput, shake, navigation],
  );

  const handleDelete = useCallback(() => {
    if (isProcessing) return;
    setCurrentPin((p) => p.slice(0, -1));
    setError('');
  }, [isProcessing]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  let stepLabel = 'Create a 6-digit PIN';
  let stepHint = 'You\'ll use this PIN to unlock ARKIENT.';

  if (step === 'current') {
    stepLabel = 'Enter Current PIN';
    stepHint = 'Enter your current 6-digit PIN to continue.';
  } else if (step === 'enter' && mode === 'change') {
    stepLabel = 'Create New PIN';
    stepHint = 'Enter a new 6-digit PIN.';
  } else if (step === 'confirm') {
    stepLabel = 'Confirm your PIN';
    stepHint = 'Re-enter the 6-digit PIN to confirm.';
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScreenHeader
        title={mode === 'change' ? 'Change PIN' : 'Set Up App Lock'}
        onBackPress={handleCancel}
      />

      <View style={styles.content}>
        <Text style={styles.stepLabel}>{stepLabel}</Text>
        <Text style={styles.stepHint}>{stepHint}</Text>

        <View style={styles.stepIndicator}>
          {mode === 'change' && <View style={[styles.stepDot, step === 'current' && styles.stepDotActive]} />}
          <View style={[styles.stepDot, step === 'enter' && styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]} />
        </View>

        <Animated.View
          style={[
            styles.dotsRow,
            { transform: [{ translateX: shakeAnim }] },
          ]}
          accessible={true}
          accessibilityLabel={`${stepLabel}: ${currentPin.length} of 6 digits entered`}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < currentPin.length && styles.dotFilled,
                !!error && styles.dotError,
              ]}
            />
          ))}
        </Animated.View>

        {!!error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : (
          <View style={styles.errorPlaceholder} />
        )}

        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.processingText}>Processing…</Text>
          </View>
        ) : (
          <View style={styles.numpad}>
            {NUMPAD_ROWS.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.numpadRow}>
                {row.map((key, keyIdx) => {
                  if (key === '') {
                    return (
                      <View key={`empty-${rowIdx}-${keyIdx}`} style={styles.numpadKey} />
                    );
                  }
                  if (key === '⌫') {
                    return (
                      <TouchableOpacity
                        key="delete"
                        style={[styles.numpadKey, styles.numpadKeyAction]}
                        onPress={handleDelete}
                        disabled={isProcessing || currentPin.length === 0}
                        accessible={true}
                        accessibilityLabel="Delete last digit"
                        accessibilityRole="button"
                      >
                        <Text style={styles.numpadDeleteText}>⌫</Text>
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.numpadKey, styles.numpadKeyDigit]}
                      onPress={() => handleDigit(key)}
                      disabled={isProcessing || currentPin.length >= 6}
                      accessible={true}
                      accessibilityLabel={`Digit ${key}`}
                      accessibilityRole="button"
                    >
                      <Text style={styles.numpadDigitText}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </View>
      <CustomAlertModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
    paddingTop: spacing['2xl'],
  },
  stepLabel: {
    ...typography.heading3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outlineVariant,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
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
    marginBottom: spacing.lg,
  },
  errorPlaceholder: {
    height: 18,
    marginBottom: spacing.lg,
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  processingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  numpad: {
    width: '100%',
    gap: spacing.sm,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  numpadKey: {
    width: 80,
    height: 64,
    borderRadius: radius.lg,
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
  numpadDigitText: {
    ...typography.heading3,
    color: colors.textPrimary,
  },
  numpadDeleteText: {
    fontSize: 22,
    color: colors.textSecondary,
  },
});
