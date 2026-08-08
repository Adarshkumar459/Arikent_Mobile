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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography } from '../../theme';
import { TextInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { authApi } from '../../services/api/authApi';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setIsLoading(false);
      const devToken = res.data?.data?.devResetToken;
      navigation.navigate('VerifyOTP', { email: email.trim() });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to send reset link. Please check the email address.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a link to reset your password.
            </Text>
          </View>

          {errorMsg ? (
            <ErrorState title="Error" message={errorMsg} onRetry={() => setErrorMsg(null)} retryLabel="Dismiss" />
          ) : null}

          <View style={styles.form}>
            <TextInput
              label="EMAIL"
              placeholder="example@mail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PrimaryButton
              title="Send Reset Link"
              onPress={handleSendResetLink}
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
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  backBtn: {
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  backText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
