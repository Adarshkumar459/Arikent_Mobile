import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { PasswordInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { useAuth } from '../../context/AuthContext';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ChangePassword'>;

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (!currentPassword) {
      setErrorMsg('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setIsLoading(false);
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to change password');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Change Password" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {errorMsg ? (
            <ErrorState title="Error" message={errorMsg} onRetry={() => setErrorMsg(null)} retryLabel="Dismiss" />
          ) : null}

          <PasswordInput
            label="CURRENT PASSWORD"
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <PasswordInput
            label="NEW PASSWORD"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <PasswordInput
            label="CONFIRM NEW PASSWORD"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View style={styles.actionWrapper}>
            <PrimaryButton
              title="Update Password"
              onPress={handleUpdate}
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
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionWrapper: {
    marginTop: spacing.md,
  },
});
