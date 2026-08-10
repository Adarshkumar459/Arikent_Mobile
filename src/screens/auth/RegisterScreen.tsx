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
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { TextInput, PasswordInput } from '../../components/inputs';
import { Button } from '../../components/buttons/Button';
import { useAuth } from '../../context/AuthContext';
import { OnboardingRepository } from '../../repositories/OnboardingRepository';
import { AuthAlertModal, AlertVariant, ActionConfig } from '../../components/modals/AuthAlertModal';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Field validation states
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showValidationBox, setShowValidationBox] = useState(false);
  const [inlineApiError, setInlineApiError] = useState<string | null>(null);

  // Error modal state
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
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setShowValidationBox(false);

    if (!name.trim()) {
      setNameError('Full name is required.');
      valid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters.');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password.');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      valid = false;
    }

    if (!valid) {
      setShowValidationBox(true);
    }

    if (valid && !agreeTerms) {
      setModalConfig({
        visible: true,
        variant: 'warning',
        title: 'Terms Required',
        message: 'Please accept the Terms of Service and Privacy Policy to continue.',
        primaryAction: { label: 'OK', onPress: () => setModalConfig((prev) => ({ ...prev, visible: false })) },
      });
      return false;
    }

    return valid;
  };

  const handleRegister = async () => {
    setInlineApiError(null);
    if (!validate()) return;

    try {
      // Mark onboarding as completed so newly registered user goes straight to Dashboard
      await OnboardingRepository.setOnboardingCompleted(true);
      await register(email.trim(), password, name.trim());
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '';

      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist')) {
        setInlineApiError('This email is already registered. Please log in instead.');
        setModalConfig({
          visible: true,
          variant: 'error',
          title: 'Email Already Registered',
          message: 'An account already exists with this email address. Please log in instead.',
          primaryAction: { label: 'Go to Login', onPress: () => navigation.navigate('Login') },
          secondaryAction: { label: 'Cancel', onPress: () => setModalConfig((prev) => ({ ...prev, visible: false })) },
        });
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('connection')) {
        setModalConfig({
          visible: true,
          variant: 'error',
          title: 'Connection Problem',
          message: "We couldn't create your account. Check your internet connection and try again.",
          primaryAction: { label: 'Retry', onPress: () => handleRegister() },
        });
      } else {
        setInlineApiError(msg || 'Registration failed. Please try again.');
        setModalConfig({
          visible: true,
          variant: 'error',
          title: 'Registration Failed',
          message: msg || "We couldn't create your account right now. Please try again.",
          primaryAction: { label: 'OK', onPress: () => setModalConfig((prev) => ({ ...prev, visible: false })) },
        });
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            {navigation.canGoBack() && (
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backArrow}>‹</Text>
              </TouchableOpacity>
            )}
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>ARKIENT</Text>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Start your journey with ARKIENT life management</Text>
          </View>

          {inlineApiError && (
            <View style={styles.apiErrorPill}>
              <View style={styles.apiErrorIconCircle}>
                <Text style={styles.apiErrorIcon}>!</Text>
              </View>
              <Text style={styles.apiErrorText}>{inlineApiError}</Text>
            </View>
          )}

          <View style={styles.formCard}>
            <TextInput
              label="FULL NAME"
              placeholder="Adarsh Kumar"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError(null);
                if (showValidationBox) setShowValidationBox(false);
              }}
              error={nameError || undefined}
            />

            <TextInput
              label="EMAIL ADDRESS"
              placeholder="adarsh@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
                if (showValidationBox) setShowValidationBox(false);
              }}
              error={emailError || undefined}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View>
              <PasswordInput
                label="PASSWORD"
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError(null);
                  if (showValidationBox) setShowValidationBox(false);
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
              label="CONFIRM PASSWORD"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmError) setConfirmError(null);
                if (showValidationBox) setShowValidationBox(false);
              }}
              error={confirmError || undefined}
            />

            <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreeTerms(!agreeTerms)}>
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms ? <Text style={styles.checkText}>✓</Text> : null}
              </View>
              <Text style={styles.checkboxLabel}>I agree to the Terms of Service and Privacy Policy</Text>
            </TouchableOpacity>

            {showValidationBox && (
              <View style={styles.validationBox}>
                <Text style={styles.validationBoxTitle}>Please fix the errors below</Text>
                {nameError && <Text style={styles.validationItem}>• {nameError}</Text>}
                {emailError && <Text style={styles.validationItem}>• {emailError}</Text>}
                {passwordError && <Text style={styles.validationItem}>• {passwordError}</Text>}
                {confirmError && <Text style={styles.validationItem}>• {confirmError}</Text>}
              </View>
            )}

            <Button
              variant="primary"
              label="Create Account →"
              onPress={handleRegister}
              isLoading={isLoading}
              disabled={isLoading}
              style={styles.createBtn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
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
    backgroundColor: '#F8FAFC',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.small,
  },
  backArrow: {
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: -3,
  },
  brandBadge: {
    backgroundColor: colors.softPurple,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  brandBadgeText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.2,
  },
  header: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  apiErrorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...elevation.small,
  },
  apiErrorIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  apiErrorIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  apiErrorText: {
    ...typography.bodySmall,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    gap: spacing.md,
    borderColor: '#EEF2FF',
    borderWidth: 1,
    ...elevation.medium,
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
    backgroundColor: '#E2E8F0',
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '800',
  },
  checkboxLabel: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 18,
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
  createBtn: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '800',
  },
});
