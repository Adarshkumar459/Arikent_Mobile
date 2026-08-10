import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { PrimaryButton } from '../../components/buttons';
import { AuthAlertModal, AlertVariant, ActionConfig } from '../../components/modals/AuthAlertModal';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyOTP'>;

export const VerifyOTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  const email = route.params?.email || 'adarsh@example.com';
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<RNTextInput | null>>([]);

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

  const handleDigitChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setModalConfig({
        visible: true,
        variant: 'warning',
        title: 'Complete OTP Code',
        message: 'Please enter all 6 digits of the OTP sent to your email.',
        primaryAction: { label: 'OK', onPress: () => setModalConfig((prev) => ({ ...prev, visible: false })) },
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('CreateNewPassword', { resetToken: 'dev-token' });
    }, 600);
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

          <View style={styles.illustrationWrapper}>
            <View style={styles.envelopeBox}>
              <Text style={styles.envelopeEmoji}>✉️</Text>
              <View style={styles.checkBadge}>
                <Text style={styles.checkBadgeIcon}>✓</Text>
              </View>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a password reset link to <Text style={styles.emailHighlight}>{email}</Text>. The link will expire in 15 minutes.
            </Text>
          </View>

          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <RNTextInput
                key={idx}
                ref={(ref) => (inputRefs.current[idx] = ref)}
                style={styles.otpBox}
                value={digit}
                onChangeText={(text) => handleDigitChange(text, idx)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <Text style={styles.resendLink}>Resend (00:30)</Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            <PrimaryButton
              title="Verify & Reset Password"
              onPress={handleVerify}
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
    alignItems: 'center',
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
  illustrationWrapper: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  envelopeBox: {
    width: 110,
    height: 90,
    borderRadius: radius.xl,
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  envelopeEmoji: {
    fontSize: 44,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  checkBadgeIcon: {
    color: colors.surface,
    fontWeight: '800',
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1.5,
    textAlign: 'center',
    ...typography.heading2,
    color: colors.textPrimary,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  resendLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  backToLoginBtn: {
    alignSelf: 'center',
  },
  backToLoginText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
