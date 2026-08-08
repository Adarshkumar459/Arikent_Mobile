import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography } from '../../theme';
import { PasswordInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { authApi } from '../../services/api/authApi';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateNewPassword'>;

export const CreateNewPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const resetToken = route.params?.resetToken || 'dev-token';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdatePassword = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMsg('Please enter and confirm your new password');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token: resetToken, password: password.trim() });
      setIsLoading(false);
      navigation.navigate('PasswordUpdated');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
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
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>Enter your new password</Text>
          </View>

          {errorMsg ? (
            <ErrorState title="Error" message={errorMsg} onRetry={() => setErrorMsg(null)} retryLabel="Dismiss" />
          ) : null}

          <View style={styles.form}>
            <PasswordInput
              label="NEW PASSWORD"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
            />

            <PasswordInput
              label="CONFIRM PASSWORD"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Text style={styles.helperText}>Password must be at least 8 characters</Text>

            <PrimaryButton
              title="Update Password"
              onPress={handleUpdatePassword}
              isLoading={isLoading}
              disabled={isLoading}
            />
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
  },
  form: {
    gap: spacing.md,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
