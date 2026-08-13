import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
  TouchableOpacity,
  Modal,
  Animated,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { useAppLock } from '../../security/AppLockContext';
import { useAuth } from '../../context/AuthContext';
import { AutoLockTimeout } from '../../security/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AppLockSettings'>;

const TIMEOUT_OPTIONS: { label: string; value: AutoLockTimeout }[] = [
  { label: 'Immediately', value: 0 },
  { label: 'After 1 minute', value: 60 },
  { label: 'After 5 minutes', value: 300 },
  { label: 'After 15 minutes', value: 900 },
];

// ---------------------------------------------------------------------------
// PIN verification modal (used when disabling App Lock)
// ---------------------------------------------------------------------------

interface PinVerifyModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  canUseBiometric: boolean;
  onBiometric: () => Promise<void>;
}

const PinVerifyModal: React.FC<PinVerifyModalProps> = ({
  visible,
  onSuccess,
  onCancel,
  canUseBiometric,
  onBiometric,
}) => {
  const { unlockWithPin } = useAppLock();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setPin('');
      setError('');
      setIsVerifying(false);
    }
  }, [visible]);

  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = async (digit: string) => {
    if (isVerifying) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');

    if (newPin.length === 6) {
      setIsVerifying(true);
      try {
        const correct = await unlockWithPin(newPin);
        if (correct) {
          onSuccess();
        } else {
          shake();
          setError('Incorrect PIN.');
          setPin('');
        }
      } catch {
        setError('An error occurred. Please try again.');
        setPin('');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleDelete = () => {
    if (isVerifying) return;
    setPin((p) => p.slice(0, -1));
    setError('');
  };

  const NUMPAD_ROWS: string[][] = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'],
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <Text style={modalStyles.title}>Verify to Disable</Text>
          <Text style={modalStyles.subtitle}>
            Authenticate to disable App Lock.
          </Text>

          <Animated.View
            style={[modalStyles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  modalStyles.dot,
                  i < pin.length && modalStyles.dotFilled,
                  !!error && modalStyles.dotError,
                ]}
              />
            ))}
          </Animated.View>

          {!!error && (
            <Text style={modalStyles.errorText} accessibilityRole="alert">
              {error}
            </Text>
          )}

          <View style={modalStyles.numpad}>
            {NUMPAD_ROWS.map((row, rowIdx) => (
              <View key={rowIdx} style={modalStyles.numpadRow}>
                {row.map((key, keyIdx) => {
                  if (key === '') return <View key={`e-${rowIdx}-${keyIdx}`} style={modalStyles.numpadKey} />;
                  if (key === '⌫') {
                    return (
                      <TouchableOpacity
                        key="del"
                        style={[modalStyles.numpadKey, modalStyles.numpadKeyAction]}
                        onPress={handleDelete}
                        disabled={isVerifying || pin.length === 0}
                        accessibilityLabel="Delete digit"
                        accessibilityRole="button"
                      >
                        <Text style={modalStyles.delText}>⌫</Text>
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[modalStyles.numpadKey, modalStyles.numpadKeyDigit, isVerifying && modalStyles.keyDisabled]}
                      onPress={() => handleDigit(key)}
                      disabled={isVerifying || pin.length >= 6}
                      accessibilityLabel={`Digit ${key}`}
                      accessibilityRole="button"
                    >
                      {isVerifying && pin.length === 6 ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Text style={modalStyles.digitText}>{key}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {canUseBiometric && (
            <TouchableOpacity
              style={modalStyles.biometricBtn}
              onPress={onBiometric}
              accessibilityLabel="Use biometric to verify"
              accessibilityRole="button"
            >
              <Text style={modalStyles.biometricText}>Use Biometric Instead</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={modalStyles.cancelBtn}
            onPress={onCancel}
            accessibilityLabel="Cancel disabling App Lock"
            accessibilityRole="button"
          >
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// AppLockSettingsScreen
// ---------------------------------------------------------------------------

export const AppLockSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const {
    lockState,
    settings,
    biometricAvailability,
    setBiometricEnabled,
    updateTimeout,
    disableAppLock,
    unlockWithBiometric,
  } = useAppLock();

  const [showPinVerifyModal, setShowPinVerifyModal] = useState(false);
  const [isBiometricToggling, setIsBiometricToggling] = useState(false);

  const isAppLockEnabled = settings.enabled && lockState !== 'DISABLED';
  const isBiometricEnabled = settings.biometricEnabled;

  const canUseBiometric =
    isBiometricEnabled && biometricAvailability?.available === true;

  // ── Toggle Master App Lock ───────────────────────────────────────────────

  const handleMasterToggle = useCallback(() => {
    if (isAppLockEnabled) {
      // Require authentication before disabling
      if (canUseBiometric) {
        Alert.alert(
          'Disable App Lock',
          'Authenticate to disable App Lock.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Use Biometric',
              onPress: async () => {
                const { enrollmentChanged } = await unlockWithBiometric();
                if (enrollmentChanged) {
                  setShowPinVerifyModal(true);
                  return;
                }
                await disableAppLock();
              },
            },
            {
              text: 'Use PIN',
              onPress: () => setShowPinVerifyModal(true),
            },
          ],
        );
      } else {
        setShowPinVerifyModal(true);
      }
    } else {
      // Navigate to PIN setup screen
      navigation.navigate('AppLockSetup', { mode: 'setup' });
    }
  }, [isAppLockEnabled, canUseBiometric, unlockWithBiometric, disableAppLock, navigation]);

  const handlePinVerifySuccess = useCallback(async () => {
    setShowPinVerifyModal(false);
    try {
      await disableAppLock();
    } catch {
      Alert.alert('Error', 'Could not disable App Lock. Please try again.');
    }
  }, [disableAppLock]);

  const handleBiometricVerify = useCallback(async () => {
    const { enrollmentChanged } = await unlockWithBiometric();
    if (!enrollmentChanged) {
      setShowPinVerifyModal(false);
      await disableAppLock();
    }
  }, [unlockWithBiometric, disableAppLock]);

  // ── Toggle Biometric ─────────────────────────────────────────────────────

  const handleBiometricToggle = useCallback(async () => {
    if (isBiometricToggling) return;
    setIsBiometricToggling(true);

    try {
      const targetState = !isBiometricEnabled;
      const res = await setBiometricEnabled(targetState);

      if (!res.success && res.reason) {
        Alert.alert('Biometric Setup', res.reason);
      }
    } finally {
      setIsBiometricToggling(false);
    }
  }, [isBiometricEnabled, isBiometricToggling, setBiometricEnabled]);

  // ── Forgot PIN ───────────────────────────────────────────────────────────

  const handleForgotPin = useCallback(() => {
    Alert.alert(
      'Forgot PIN?',
      'To reset your App Lock PIN, you need to log in to your account again. Your notes and data are safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log In Again',
          style: 'destructive',
          onPress: async () => {
            await disableAppLock();
            await logout();
          },
        },
      ],
    );
  }, [disableAppLock, logout]);

  // Biometric status message
  let biometricMessage = 'Use fingerprint or Face ID for faster unlocking';
  let biometricSupported = true;

  if (biometricAvailability) {
    if (!biometricAvailability.hasHardware) {
      biometricMessage = 'Not available on this device';
      biometricSupported = false;
    } else if (!biometricAvailability.enrolled) {
      biometricMessage = "Biometric isn't set up on this device. You can continue using your PIN.";
      biometricSupported = false;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScreenHeader title="App Lock" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── MASTER APP LOCK TOGGLE ──────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLabelGroup}>
              <Text style={styles.rowTitle}>App Lock</Text>
              <Text style={styles.rowSubtitle}>
                {isAppLockEnabled ? 'Require authentication to open ARKIENT' : 'Protect ARKIENT with a PIN'}
              </Text>
            </View>
            <Switch
              value={isAppLockEnabled}
              onValueChange={handleMasterToggle}
              trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
              thumbColor={isAppLockEnabled ? colors.primary : colors.outline}
              disabled={lockState === 'LOADING' || lockState === 'ERROR'}
            />
          </View>

          {/* ── BIOMETRIC TOGGLE (#4, #5, #6, #7) ────────────────────── */}
          {isAppLockEnabled && (
            <View style={styles.divider}>
              <View style={styles.rowBetween}>
                <View style={styles.rowLabelGroup}>
                  <Text style={[styles.rowTitle, !biometricSupported && styles.disabledText]}>
                    Unlock with biometric
                  </Text>
                  <Text style={[styles.rowSubtitle, !biometricSupported && styles.disabledText]}>
                    {biometricMessage}
                  </Text>
                </View>

                {isBiometricToggling ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Switch
                    value={isBiometricEnabled}
                    onValueChange={handleBiometricToggle}
                    trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                    thumbColor={isBiometricEnabled ? colors.primary : colors.outline}
                    disabled={!biometricSupported || isBiometricToggling}
                  />
                )}
              </View>
            </View>
          )}
        </View>

        {/* ── AUTO-LOCK TIMEOUT (#11) ─────────────────────────────────── */}
        {isAppLockEnabled && (
          <View style={styles.card}>
            <Text style={styles.cardSectionHeader}>AUTOMATICALLY LOCK</Text>

            <View style={styles.timeoutList}>
              {TIMEOUT_OPTIONS.map((opt) => {
                const isSelected = settings.timeout === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={styles.radioRow}
                    onPress={() => updateTimeout(opt.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── PIN ACTIONS (#15, #16, #17) ────────────────────────────── */}
        {isAppLockEnabled && (
          <View style={styles.card}>
            <Text style={styles.cardSectionHeader}>PIN MANAGEMENT</Text>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('AppLockSetup', { mode: 'change' })}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🔑</Text>
              <Text style={styles.actionText}>Change PIN</Text>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.rowBorder} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleForgotPin}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>↩️</Text>
              <Text style={styles.actionTextDanger}>Forgot PIN / Reset App Lock</Text>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      <PinVerifyModal
        visible={showPinVerifyModal}
        onSuccess={handlePinVerifySuccess}
        onCancel={() => setShowPinVerifyModal(false)}
        canUseBiometric={canUseBiometric}
        onBiometric={handleBiometricVerify}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...elevation.small,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabelGroup: {
    flex: 1,
    paddingRight: spacing.md,
  },
  rowTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  disabledText: {
    color: colors.textDisabled,
  },
  divider: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardSectionHeader: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  timeoutList: {
    gap: spacing.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  radioLabelSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  actionText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  actionTextDanger: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '500',
  },
  actionChevron: {
    fontSize: 22,
    color: colors.outline,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
  },
  title: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
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
    marginBottom: spacing.md,
    height: 18,
  },
  numpad: {
    width: '100%',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  numpadKey: {
    width: 72,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadKeyDigit: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.border,
  },
  numpadKeyAction: {
    backgroundColor: colors.surfaceContainer,
  },
  keyDisabled: {
    opacity: 0.4,
  },
  digitText: {
    ...typography.heading4,
    color: colors.textPrimary,
  },
  delText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  biometricBtn: {
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  biometricText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: spacing.md,
  },
  cancelText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
