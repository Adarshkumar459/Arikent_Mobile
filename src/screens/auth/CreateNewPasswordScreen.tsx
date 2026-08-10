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

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateNewPassword'>;

export const CreateNewPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const resetToken = route.params?.resetToken || 'dev-token';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Requirements Check
  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const getStrengthScore = () => {
    let score = 0;
    if (hasLength) score++;
    if (hasUppercase) score++;
    if (hasNumber || hasSpecial) score++;
    return score;
  };

  const strengthScore = getStrengthScore();

  const handleUpdatePassword = async () => {
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedPassword || !trimmedConfirmPassword) {
      showAlert('Password Error', 'Please enter and confirm your new password.');
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

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token: resetToken, password: trimmedPassword });
      setIsLoading(false);
      showAlert(
        'Password Updated!',
        'Your password has been updated successfully. Please log in with your new password.',
        'success',
        [
          {
            text: 'Go to Log In',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err: any) {
      setIsLoading(false);
      const apiError = parseErrorMessage(err);
      showAlert('Update Failed', apiError);
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
              <Text style={styles.title}>Create a new password</Text>
              <Text style={styles.subtitle}>
                Choose a strong password you haven't used before.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* New Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>New Password</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
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
                      <View
                        style={[
                          styles.strengthBar,
                          strengthScore >= 1
                            ? strengthScore === 1
                              ? styles.barWeak
                              : strengthScore === 2
                              ? styles.barMedium
                              : styles.barStrong
                            : styles.barInactive,
                        ]}
                      />
                      <View
                        style={[
                          styles.strengthBar,
                          strengthScore >= 2
                            ? strengthScore === 2
                              ? styles.barMedium
                              : styles.barStrong
                            : styles.barInactive,
                        ]}
                      />
                      <View
                        style={[
                          styles.strengthBar,
                          strengthScore === 3 ? styles.barStrong : styles.barInactive,
                        ]}
                      />
                    </View>
                    <Text style={styles.strengthLabel}>
                      {strengthScore === 1 ? 'Weak' : strengthScore === 2 ? 'Medium' : strengthScore === 3 ? 'Strong' : ''}
                    </Text>
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

              {/* Confirm Password Field */}
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
                    placeholder="Confirm new password"
                    placeholderTextColor="#A19DAE"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                  />
                </View>
                {confirmPassword && password !== confirmPassword ? (
                  <Text style={styles.mismatchText}>Passwords do not match.</Text>
                ) : null}
              </View>

              {/* Submit Button */}
              <PrimaryButton
                title="Update Password →"
                onPress={handleUpdatePassword}
                isLoading={isLoading}
                disabled={isLoading}
                style={styles.submitBtn}
              />
            </View>

            {/* Footer */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>
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
  title: {
    ...typography.heading1,
    fontSize: 24,
    color: '#1B1B1D',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyLarge,
    fontSize: 14,
    color: '#484555',
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
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
    justifyContent: 'space-between',
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
  barMedium: { backgroundColor: '#F59E0B' },
  barStrong: { backgroundColor: '#10B981' },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#797586',
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
  mismatchText: {
    fontSize: 11,
    color: '#BA1A1A',
    marginTop: 2,
  },
  submitBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#6C4CE8',
  },
  backBtn: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.xs,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#532DCF',
  },
});
