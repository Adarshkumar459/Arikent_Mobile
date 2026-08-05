import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { authApi } from '../../services/api/authApi';
import { Button } from '../../components/buttons/Button';
import { Logo } from '../../components/brand/Logo';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setMessage(null);
    setDevToken(null);

    try {
      const res = await authApi.forgotPassword(email);
      if (res.data && res.data.success) {
        setMessage('Password reset requested successfully.');
        if (res.data.data?.devResetToken) {
          setDevToken(res.data.data.devResetToken);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Logo size="md" />
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your account email to receive a password reset token.</Text>
      </View>

      <View style={styles.card}>
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {message ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{message}</Text>
          </View>
        ) : null}

        {devToken ? (
          <View style={styles.devBox}>
            <Text style={styles.devTitle}>Development Reset Token:</Text>
            <Text style={styles.devTokenText} selectable>{devToken}</Text>
            <Button
              variant="secondary"
              label="Proceed to Reset Password Screen"
              onPress={() => navigation.navigate('ResetPassword', { devToken })}
              style={styles.devButton}
            />
          </View>
        ) : null}

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.textSecondary}
        />

        <Button
          variant="primary"
          label="Send Reset Request"
          isLoading={loading}
          onPress={handleRequestReset}
          style={styles.button}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backRow}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    ...elevation.medium,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    marginTop: spacing.xl,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
  },
  successBox: {
    backgroundColor: '#DCFCE7',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  successText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  devBox: {
    backgroundColor: '#EFF6FF',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  devTitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  devTokenText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.textPrimary,
    marginVertical: spacing.xs,
  },
  devButton: {
    marginTop: spacing.sm,
  },
  backRow: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  linkText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
