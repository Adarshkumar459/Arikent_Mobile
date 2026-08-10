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
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { PrimaryButton } from '../../components/buttons';
import { authApi } from '../../services/api/authApi';
import { CustomAlert, AlertButton } from '../../components/alerts/CustomAlert';
import { parseErrorMessage } from '../../utils/errorUtils';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Requirement boolean flags
  const hasLength = (password || '').length >= 8;
  const hasUppercase = /[A-Z]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password || '');

  // Custom CSS Styled Alert Modal state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'warning' | 'info';
    buttons?: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'error' | 'success' | 'warning' | 'info' = 'error',
    buttons?: AlertButton[]
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // Dynamic Password Strength Meter
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8 && /[A-Z]/.test(password)) score++;
    if (password.length >= 8 && /[0-9]/.test(password)) score++;
    if (password.length >= 10 && /[^A-Za-z0-9]/.test(password)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return { score, label: labels[score] || 'Strong' };
  };

  const strength = getPasswordStrength();

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      showAlert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    if (trimmedPassword.length < 8) {
      showAlert('Invalid Password', 'Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(trimmedPassword)) {
      showAlert('Invalid Password', 'Password must contain at least one uppercase letter (A-Z).');
      return;
    }
    if (!/[0-9]/.test(trimmedPassword)) {
      showAlert('Invalid Password', 'Password must contain at least one number (0-9).');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmedPassword)) {
      showAlert(
        'Invalid Password',
        'Password must contain at least one symbol/special character (e.g. !@#$).'
      );
      return;
    }
    if (trimmedPassword !== trimmedConfirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      showAlert('Terms Required', 'You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register({
        email: trimmedEmail,
        password: trimmedPassword,
        name: trimmedName,
      });

      setIsLoading(false);
      if (response.data && response.data.success) {
        showAlert(
          'Account Created!',
          'Your account has been created successfully. Please log in to continue.',
          'success',
          [
            {
              text: 'Go to Log In',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        showAlert('Registration Error', response.data.message || 'Failed to create account.');
      }
    } catch (err: any) {
      setIsLoading(false);
      const apiError = parseErrorMessage(err);
      if (apiError.toLowerCase().includes('already exists') || apiError.toLowerCase().includes('taken')) {
        showAlert(
          'Account Exists',
          'User already exists with this email. Please log in to your account.',
          'warning',
          [
            {
              text: 'Go to Log In',
              onPress: () => navigation.navigate('Login'),
            },
            {
              text: 'Close',
              variant: 'secondary',
            },
          ]
        );
      } else {
        showAlert('Registration Error', apiError);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F1FF" />

      {/* Ambient background lighting */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

      {/* Custom Styled CSS Popup Alert Modal */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card */}
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.brandTitle}>ARKIENT</Text>
              <Text style={styles.brandSubtitle}>Create your account</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Jane Doe"
                    placeholderTextColor="#A19DAE"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="jane@example.com"
                    placeholderTextColor="#A19DAE"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#A19DAE"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <Text style={styles.eyeIcon}>{isPasswordVisible ? '👁️' : '🙈'}</Text>
                  </TouchableOpacity>
                </View>
                {/* Strength Meter Bar */}
                {password ? (
                  <View style={styles.strengthWrapper}>
                    <View style={styles.barsRow}>
                      {[1, 2, 3, 4].map((barIdx) => (
                        <View
                          key={barIdx}
                          style={[
                            styles.strengthBar,
                            barIdx <= strength.score
                              ? barIdx <= 2
                                ? styles.barWeak
                                : barIdx === 3
                                ? styles.barFair
                                : styles.barStrong
                              : styles.barInactive,
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.strengthLabel}>{strength.label}</Text>
                  </View>
                ) : null}

                {/* Requirements Checklist */}
                <View style={styles.reqList}>
                  <View style={styles.reqItem}>
                    <Text style={styles.reqIcon}>{hasLength ? '✓' : '•'}</Text>
                    <Text style={[styles.reqText, hasLength && styles.reqTextSuccess]}>
                      At least 8 characters
                    </Text>
                  </View>
                  <View style={styles.reqItem}>
                    <Text style={styles.reqIcon}>{hasUppercase ? '✓' : '•'}</Text>
                    <Text style={[styles.reqText, hasUppercase && styles.reqTextSuccess]}>
                      Contains an uppercase letter (A-Z)
                    </Text>
                  </View>
                  <View style={styles.reqItem}>
                    <Text style={styles.reqIcon}>{hasNumber ? '✓' : '•'}</Text>
                    <Text style={[styles.reqText, hasNumber && styles.reqTextSuccess]}>
                      Contains a number (0-9)
                    </Text>
                  </View>
                  <View style={styles.reqItem}>
                    <Text style={styles.reqIcon}>{hasSpecial ? '✓' : '•'}</Text>
                    <Text style={[styles.reqText, hasSpecial && styles.reqTextSuccess]}>
                      Contains a symbol/special character
                    </Text>
                  </View>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputBox,
                    confirmPassword && password !== confirmPassword ? styles.inputErrorBorder : null,
                  ]}
                >
                  <Text style={styles.inputIcon}>🔄</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#A19DAE"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!isConfirmPasswordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  >
                    <Text style={styles.eyeIcon}>{isConfirmPasswordVisible ? '👁️' : '🙈'}</Text>
                  </TouchableOpacity>
                </View>
                {confirmPassword && password !== confirmPassword ? (
                  <Text style={styles.mismatchText}>Passwords do not match</Text>
                ) : null}
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                  {agreeTerms ? <Text style={styles.checkIcon}>✓</Text> : null}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                  <Text style={styles.linkText}>Privacy Policy</Text>.
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <PrimaryButton
                title="Create Account"
                onPress={handleRegister}
                isLoading={isLoading}
                disabled={isLoading}
                style={styles.submitBtn}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F1FF',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(108, 76, 232, 0.12)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(203, 190, 255, 0.18)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E8E4F5',
    ...elevation.medium,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandTitle: {
    ...typography.display,
    fontSize: 28,
    fontWeight: '800',
    color: '#532DCF',
    marginBottom: spacing.xs,
  },
  brandSubtitle: {
    ...typography.bodyLarge,
    fontSize: 14,
    color: '#484555',
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#484555',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#C9C4D7',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  inputErrorBorder: {
    borderColor: '#BA1A1A',
  },
  inputIcon: {
    fontSize: 15,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    ...typography.body,
    fontSize: 14,
    color: '#1B1B1D',
  },
  eyeBtn: {
    padding: spacing.xs,
  },
  eyeIcon: {
    fontSize: 16,
  },
  strengthWrapper: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justify.content: 'space-between',
  },
  barsRow: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    marginRight: spacing.sm,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  barInactive: { backgroundColor: '#E4E2E4' },
  barWeak: { backgroundColor: '#BA1A1A' },
  barFair: { backgroundColor: '#F59E0B' },
  barStrong: { backgroundColor: '#10B981' },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#797586',
  },
  mismatchText: {
    fontSize: 11,
    color: '#BA1A1A',
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#532DCF',
    alignItems: 'center',
    justify.content: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#532DCF',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#484555',
    lineHeight: 18,
  },
  linkText: {
    color: '#532DCF',
    fontWeight: '600',
  },
  submitBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#6C4CE8',
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justify.content: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: '#484555',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#532DCF',
  },
  reqList: {
    marginTop: spacing.xs,
    gap: 4,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reqIcon: {
    fontSize: 12,
    marginRight: 6,
    color: '#797586',
  },
  reqText: {
    fontSize: 12,
    color: '#797586',
  },
  reqTextSuccess: {
    color: '#10B981',
    fontWeight: '600',
  },
});
