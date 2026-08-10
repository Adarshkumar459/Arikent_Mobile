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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Level 1 Field Validation Errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showValidationBox, setShowValidationBox] = useState(false);
  const [inlineApiError, setInlineApiError] = useState<string | null>(null);

  // Level 2 Application/Server Error Modal
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

  const validateFields = () => {
    let valid = true;
    setEmailError(null);
    setPasswordError(null);
    setShowValidationBox(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      valid = false;
    }

    if (!valid) {
      setShowValidationBox(true);
    }

    return valid;
  };

  const handleLogin = async () => {
    setInlineApiError(null);
    if (!validateFields()) return;

    try {
      // Mark onboarding as completed so logged-in user goes straight to Dashboard
      await OnboardingRepository.setOnboardingCompleted(true);
      await login(email.trim(), password);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '';

      if (msg.toLowerCase().includes('password')) {
        setInlineApiError('Invalid email or password. Please try again.');
        setModalConfig({
          visible: true,
          variant: 'error',
          title: 'Incorrect Password',
          message: 'The password you entered is incorrect. Please try again.',
          primaryAction: { label: 'Try Again', onPress: () => setModalConfig((prev) => ({ ...prev, visible: false })) },
          secondaryAction: { label: 'Forgot Password?', onPress: () => navigation.navigate('ForgotPassword') },
        });
      } else if (msg.toLowerCase().includes('found') || msg.toLowerCase().includes('exist')) {
        setInlineApiError('Invalid email or password. Please try again.');
        setModalConfig({
          visible: true,
          variant: 'error',
          title: 'Account Not Found',
          message: "We couldn't find an account with this email address.",
          primaryAction: { label: 'Try Again', onPress: () => setModalConfig((prev) => ({ ...prev, visible: false })) },
          secondaryAction: { label: 'Create Account', onPress: () => navigation.navigate('Register') },
        });
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('connection')) {
        setModalConfig({
          visible: true,
          variant: 'error',
          title: 'No Internet Connection',
          message: 'Please check your internet connection and try again.',
          primaryAction: { label: 'Retry', onPress: () => handleLogin() },
        });
      } else {
        setInlineApiError(msg || 'Authentication failed. Please try again.');
        setModalConfig({
          visible: true,
          variant: 'error',
          title: 'Something Went Wrong',
          message: "We couldn't complete your request right now. Please try again later.",
          primaryAction: { label: 'Try Again', onPress: () => setModalConfig((prev) => ({ ...prev, visible: false })) },
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
            <Text style={styles.title}>Welcome Back! 👋</Text>
            <Text style={styles.subtitle}>Log in to continue to your life management workspace</Text>
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
              <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {showValidationBox && (
              <View style={styles.validationBox}>
                <Text style={styles.validationBoxTitle}>Please fix the errors below</Text>
                {emailError && <Text style={styles.validationItem}>• {emailError}</Text>}
                {passwordError && <Text style={styles.validationItem}>• {passwordError}</Text>}
              </View>
            )}

            <Button
              variant="primary"
              label="Log In →"
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={isLoading}
              style={styles.loginBtn}
            />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={[styles.socialText, { color: '#EA4335' }]}>G</Text>
              <Text style={styles.socialLabel}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn}>
              <Text style={[styles.socialText, { color: '#000000' }]}></Text>
              <Text style={styles.socialLabel}>Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.createLink}>Create Account</Text>
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
  },
  forgotText: {
    ...typography.bodySmall,
    color: colors.primary,
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
  loginBtn: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 50,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    ...elevation.small,
  },
  socialText: {
    fontSize: 20,
    fontWeight: '800',
  },
  socialLabel: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
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
  createLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '800',
  },
});
