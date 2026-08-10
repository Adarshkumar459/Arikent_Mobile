import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { PasswordInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { authApi } from '../../services/api/authApi';
import { AuthAlertModal, AlertVariant, ActionConfig } from '../../components/modals/AuthAlertModal';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateNewPassword'>;

export const CreateNewPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  const resetToken = route.params?.resetToken || 'dev-token';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showValidationBox, setShowValidationBox] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    variant: AlertVariant;
    title: string;
    message: string;
    primaryAction?: ActionConfig;
    secondaryAction?: ActionConfig;
  }>({
    visible: false,
    variant: 'error',
    title: '',
    message: '',
  });

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: colors.border, flex: 0 };
    if (pass.length < 8) return { label: 'Weak', color: '#EF4444', flex: 0.33 };
    const hasSpecial = /[A-Z]/.test(pass) && /[0-9]/.test(pass);
    if (hasSpecial) return { label: 'Strong', color: '#16A34A', flex: 1 };
    return { label: 'Medium', color: '#F59E0B', flex: 0.66 };
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    let valid = true;
    setPasswordError(null);
    setConfirmError(null);
    setShowValidationBox(false);

    if (!password) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Passwords do not match.');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      valid = false;
    }

    if (!valid) {
      setShowValidationBox(true);
    }

    return valid;
  };

  const handleUpdatePassword = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token: resetToken, password: password.trim() });
      setIsLoading(false);
      navigation.navigate('PasswordUpdated');
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.response?.data?.message || err?.message || '';

      if (msg.toLowerCase().includes('expired')) {
        setModalConfig({
          visible: true,
          variant: 'error',
          title: 'Reset Link Expired',
          message: 'This password reset link has expired. Please request a new reset link.',
          primaryAction: { label: 'Request New Link', onPress: () => navigation.navigate('ForgotPassword') },
          secondaryAction: { label: 'Back to Login', onPress: () => navigation.navigate('Login') },
        });
      } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('token')) {
        setModalConfig({
          visible: true,
          variant: 'error',
          title: 'Invalid Reset Link',
          message: 'This password reset link is invalid or has already been used.',
          primaryAction: { label: 'Request New Link', onPress: () => navigation.navigate('ForgotPassword') },
          secondaryAction: { label: 'Back to Login', onPress: () => navigation.navigate('Login') },
        });
      } else {
        setModalConfig({
          visible: true,
          variant: 'error',
          title: 'Something Went Wrong',
          message: "We couldn't reset your password right now. Please try again.",
          primaryAction: { label: 'Retry', onPress: () => handleUpdatePassword() },
        });
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>Enter your new password below.</Text>
          </View>

          <View style={styles.form}>
            <View>
              <PasswordInput
                label="New Password"
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError(null);
                }}
                error={passwordError || undefined}
              />
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthTrack}>
                    <View style={[styles.strengthFill, { width: `${strength.flex * 100}%`, backgroundColor: strength.color }]} />
                  </View>
                  <Text style={[styles.strengthText, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}
            </View>

            <PasswordInput
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmError) setConfirmError(null);
              }}
              error={confirmError || undefined}
            />

            {showValidationBox && (
              <View style={styles.validationBox}>
                <Text style={styles.validationBoxTitle}>Please fix the errors above</Text>
                {passwordError && <Text style={styles.validationItem}>• Password must be at least 8 characters</Text>}
                {confirmError && <Text style={styles.validationItem}>• Passwords do not match</Text>}
              </View>
            )}

            <PrimaryButton
              title="Reset Password"
              onPress={handleUpdatePassword}
              isLoading={isLoading}
              disabled={isLoading}
            />

            <TouchableOpacity style={styles.backToLoginBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backToLoginText}>Back to Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AuthAlertModal
        visible={modalConfig.visible}
        variant={modalConfig.variant}
        title={modalConfig.title}
        message={modalConfig.message}
        primaryAction={modalConfig.primaryAction}
        secondaryAction={modalConfig.secondaryAction}
        onDismiss={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  topBar: {
    width: '100%',
    height: 36,
    justifyContent: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: -4,
  },
  header: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    ...typography.caption,
    fontWeight: '700',
  },
  validationBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  validationBoxTitle: {
    ...typography.bodySmall,
    color: '#DC2626',
    fontWeight: '700',
    marginBottom: 2,
  },
  validationItem: {
    ...typography.caption,
    color: '#DC2626',
  },
  backToLoginBtn: {
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  backToLoginText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
