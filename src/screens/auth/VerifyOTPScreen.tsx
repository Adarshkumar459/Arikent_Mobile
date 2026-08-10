import React, { useState, useRef, useEffect } from 'react';
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
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { PrimaryButton } from '../../components/buttons';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyOTP'>;

export const VerifyOTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const email = route.params?.email || 'user@example.com';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<RNTextInput | null>>([]);

  const initialOtpCode = route.params?.otpCode;

  // Auto-fill OTP on initial render
  useEffect(() => {
    if (initialOtpCode && initialOtpCode.length === 6) {
      setOtp(initialOtpCode.split(''));
    }
  }, [initialOtpCode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleDigitChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);

    if (cleanText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    const newRandomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(newRandomOtp.split(''));
    setTimer(30);
    setCanResend(false);
    setErrorMsg(null);
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the code');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    const resetToken = route.params?.resetToken || fullOtp;
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('CreateNewPassword', { resetToken });
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F1FF" />

      {/* Ambient background lighting */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

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
            {/* Mail Icon Graphic */}
            <View style={styles.iconCircle}>
              <Text style={styles.mailIcon}>✉️</Text>
            </View>

            {/* Title & Subtitle */}
            <View style={styles.header}>
              <Text style={styles.title}>Verify your email</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit verification code to{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
            </View>

            {/* Error Message */}
            {errorMsg ? (
              <ErrorState
                title="Verification Error"
                message={errorMsg}
                onRetry={() => setErrorMsg(null)}
                retryLabel="Dismiss"
              />
            ) : null}

            {/* Auto-filled Badge */}
            {otp.join('').length === 6 ? (
              <View style={styles.autoFilledBadge}>
                <Text style={styles.autoFilledText}>✨ Code Auto-Filled: {otp.join('')}</Text>
              </View>
            ) : null}

            {/* 6-Digit OTP Inputs */}
            <View style={styles.otpGrid}>
              {otp.map((digit, idx) => (
                <RNTextInput
                  key={idx}
                  ref={(ref) => (inputRefs.current[idx] = ref)}
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                  value={digit}
                  onChangeText={(text) => handleDigitChange(text, idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Resend Code Section */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={!canResend} activeOpacity={0.7}>
                <Text style={[styles.resendLink, !canResend && styles.resendDisabled]}>
                  {canResend ? 'Resend Code' : `Resend Code (00:${timer < 10 ? `0${timer}` : timer})`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <PrimaryButton
                title="Verify Code →"
                onPress={handleVerify}
                isLoading={isLoading}
                disabled={isLoading}
                style={styles.submitBtn}
              />

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.backText}>← Back to Log In</Text>
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
  mailIcon: {
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
  emailHighlight: {
    fontWeight: '700',
    color: '#1B1B1D',
  },
  otpGrid: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9C4D7',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1B1B1D',
  },
  otpBoxFilled: {
    borderColor: '#532DCF',
    backgroundColor: '#F0EFFF',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resendText: {
    fontSize: 13,
    color: '#484555',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#532DCF',
  },
  resendDisabled: {
    color: '#797586',
    fontWeight: '400',
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  submitBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#6C4CE8',
  },
  backBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#484555',
  },
  autoFilledBadge: {
    backgroundColor: '#F0EFFF',
    borderColor: '#CABEFF',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
  },
  autoFilledText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#532DCF',
  },
});
