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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { PrimaryButton } from '../../components/buttons';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyOTP'>;

export const VerifyOTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const email = route.params?.email || 'example@mail.com';
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRefs = useRef<Array<RNTextInput | null>>([]);

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
      setErrorMsg('Please enter all 6 digits');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('CreateNewPassword', { resetToken: 'dev-token' });
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.iconBox}>
            <Text style={styles.shieldIcon}>🛡️</Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the 6 digit code sent to {email}</Text>
          </View>

          {errorMsg ? (
            <ErrorState title="Verification Error" message={errorMsg} onRetry={() => setErrorMsg(null)} retryLabel="Dismiss" />
          ) : null}

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
              title="Verify OTP"
              onPress={handleVerify}
              isLoading={isLoading}
              disabled={isLoading}
            />

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
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
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  shieldIcon: {
    fontSize: 28,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
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
    marginTop: spacing.md,
  },
  backBtn: {
    alignSelf: 'center',
  },
  backText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
