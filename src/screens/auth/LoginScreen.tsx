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
import { useAuth } from '../../context/AuthContext';
import { CustomAlert, AlertButton } from '../../components/alerts/CustomAlert';
import { parseErrorMessage } from '../../utils/errorUtils';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      showAlert('Missing Credentials', 'Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(trimmedEmail, trimmedPassword);
      setIsLoading(false);
      // On success, AuthContext sets user -> RootNavigator opens Main Dashboard!
    } catch (err: any) {
      setIsLoading(false);
      const apiError = parseErrorMessage(err);
      const isNotFound =
        apiError.toLowerCase().includes('not exist') ||
        apiError.toLowerCase().includes('no account') ||
        apiError.toLowerCase().includes('user not found');

      if (isNotFound) {
        showAlert(
          'Account Not Found',
          'Account does not exist with this email. Would you like to create an account?',
          'warning',
          [
            {
              text: 'Create Account',
              onPress: () => navigation.navigate('Register'),
            },
            {
              text: 'Try Again',
              variant: 'secondary',
            },
          ]
        );
      } else {
        showAlert(
          'Login Failed',
          apiError.toLowerCase().includes('password')
            ? 'Incorrect password. Please verify your password and try again.'
            : apiError
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F1FF" />

      {/* Atmospheric Background Lighting */}
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
              <Text style={styles.brandSubtitle}>Everything that matters, together.</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <View style={styles.labelBadge}>
                  <Text style={styles.labelText}>Email</Text>
                </View>
                <View style={styles.inputFieldBox}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor="#A19DAE"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <View style={styles.labelBadge}>
                  <Text style={styles.labelText}>Password</Text>
                </View>
                <View style={styles.inputFieldBox}>
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
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Primary Login Button */}
              <PrimaryButton
                title="Login →"
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={isLoading}
                style={styles.submitBtn}
              />
            </View>

            {/* Footer Divider & Create Account Link */}
            <View style={styles.footer}>
              <View style={styles.dividerLine} />
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                  <Text style={styles.createLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
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
    fontSize: 30,
    fontWeight: '800',
    color: '#532DCF',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  brandSubtitle: {
    ...typography.bodyLarge,
    fontSize: 14,
    color: '#484555',
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
  },
  inputWrapper: {
    position: 'relative',
  },
  labelBadge: {
    position: 'absolute',
    top: -9,
    left: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    zIndex: 10,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#532DCF',
  },
  inputFieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#C9C4D7',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    ...typography.body,
    fontSize: 15,
    color: '#1B1B1D',
  },
  eyeBtn: {
    padding: spacing.xs,
  },
  eyeIcon: {
    fontSize: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#532DCF',
  },
  submitBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#6C4CE8',
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E4E2E4',
    marginBottom: spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#484555',
  },
  createLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#532DCF',
  },
});
