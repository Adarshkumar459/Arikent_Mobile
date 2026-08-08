import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TextInput } from '../../components/inputs';
import { DangerButton } from '../../components/buttons';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'DeleteAccount'>;

export const DeleteAccountScreen: React.FC<Props> = () => {
  const { deleteAccount } = useAuth();
  const [confirmInput, setConfirmInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = () => {
    if (confirmInput.trim().toUpperCase() !== 'DELETE') {
      Alert.alert('Validation Error', 'Please type DELETE to confirm account removal');
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'This action cannot be undone. Are you absolutely sure you want to permanently delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteAccount();
            } catch (err: any) {
              setIsLoading(false);
              Alert.alert('Error', err.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Delete Account" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningTitle}>Permanent Deletion Warning</Text>
            <Text style={styles.warningText}>
              Deleting your account will permanently wipe all your associated data, including tasks, expenses, goals, reminders, and profile settings. This action is IRREVERSIBLE.
            </Text>
          </View>

          <TextInput
            label="TYPE 'DELETE' TO CONFIRM"
            placeholder="DELETE"
            value={confirmInput}
            onChangeText={setConfirmInput}
            autoCapitalize="characters"
          />

          <View style={styles.actionWrapper}>
            <DangerButton
              title="Permanently Delete Account"
              onPress={handleDelete}
              isLoading={isLoading}
              disabled={isLoading || confirmInput.trim().toUpperCase() !== 'DELETE'}
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
    gap: spacing.lg,
  },
  warningCard: {
    backgroundColor: colors.errorBackground,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    ...elevation.small,
  },
  warningIcon: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  warningTitle: {
    ...typography.heading3,
    color: colors.error,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionWrapper: {
    marginTop: spacing.md,
  },
});
