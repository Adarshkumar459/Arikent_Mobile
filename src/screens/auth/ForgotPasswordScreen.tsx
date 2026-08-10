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

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
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

  const handleSendResetLink = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showAlert('Invalid Email', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword(trimmedEmail);
      const devResetToken = response.data?.data?.devResetToken;
      const otpCode = response.data?.data?.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
      setIsLoading(false);
      showAlert(
        'Code Sent!',
        `Verification OTP code ${otpCode} sent to your email.`,
        'success',
        [
          {
            text: 'Verify Code',
            onPress: () =>
              navigation.navigate('VerifyOTP', {
                email: trimmedEmail,
                resetToken: devResetToken,
                otpCode,
              }),
          },
        ]
      );
    } catch (err: any) {
      setIsLoading(false);
      const apiError = parseErrorMessage(err);
      showAlert(
        'Email Not Found',
        apiError.toLowerCase().includes('not found') || apiError.toLowerCase().includes('valid') || apiError.toLowerCase().includes('no account')
          ? 'No account found with this email. Please enter a valid registered email.'
          : apiError
      );
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
            {/* Lock Reset Graphic Badge */}
            <View style={styles.iconCircle}>
              <Text style={styles.lockIcon}>🔑</Text>
            </View>

            {/* Typography Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Forgot your password?</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a code to reset your password.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <View style={styles.labelBadge}>
                  <Text style={styles.labelText}>Email Address</Text>
                </View>
                <View style={styles.inputFieldBox}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="hello@arkient.com"
                    placeholderTextColor="#A19DAE"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <PrimaryButton
                title="Send Reset Code →"
                onPress={handleSendResetLink}
                isLoading={isLoading}
                disabled={isLoading}
                style={styles.submitBtn}
              />
            </View>

            {/* Back to Login Footer Link */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>← Back to Log In</Text>
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4F5',
    ...elevation.medium,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6DEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  lockIcon: {
    fontSize: 34,
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
    lineHeight: 20,
  },
  form: {
    width: '100%',
    gap: spacing.lg,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
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
    fontSize: 14,
    color: '#1B1B1D',
  },
  submitBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#6C4CE8',
  },
  backBtn: {
    marginTop: spacing.xl,
    paddingVertical: spacing.xs,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#484555',
  },
});
