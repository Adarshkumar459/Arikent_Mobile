import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TextInput } from '../../components/inputs';
import { DangerButton } from '../../components/buttons';
import { useAuth } from '../../context/AuthContext';
import { useCustomAlert } from '../../components/alerts/CustomAlert';

type Props = NativeStackScreenProps<ProfileStackParamList, 'DeleteAccount'>;

export const DeleteAccountScreen: React.FC<Props> = () => {
  const { deleteAccount } = useAuth();
  const { showAlert, CustomAlertModal } = useCustomAlert();
  const [confirmInput, setConfirmInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = () => {
    if (confirmInput.trim().toUpperCase() !== 'DELETE') {
      showAlert('Validation Error', 'Please type DELETE to confirm account removal.', 'warning');
      return;
    }

    showAlert(
      'Final Confirmation',
      'This action cannot be undone. Are you absolutely sure you want to permanently delete your account?',
      'warning',
      [
        { text: 'Cancel', variant: 'secondary' },
        {
          text: 'Delete Account',
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteAccount();
            } catch (err: any) {
              setIsLoading(false);
              showAlert('Error', err.message || 'Failed to delete account', 'error');
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
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningTitle}>Warning: Permanent Action</Text>
            <Text style={styles.warningText}>
              Deleting your account will permanently remove all your data, including tasks,
              expenses, goals, and notes. This action cannot be reversed.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.confirmLabel}>
              Type <Text style={styles.boldText}>DELETE</Text> below to confirm:
            </Text>

            <TextInput
              placeholder="DELETE"
              value={confirmInput}
              onChangeText={setConfirmInput}
              autoCapitalize="characters"
              style={styles.input}
            />

            <DangerButton
              title="Permanently Delete My Account"
              onPress={handleDelete}
              isLoading={isLoading}
              disabled={confirmInput.trim().toUpperCase() !== 'DELETE' || isLoading}
              style={styles.deleteBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomAlertModal />
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
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  warningIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  warningTitle: {
    ...typography.subtitle,
    color: colors.error,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...elevation.small,
  },
  confirmLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  boldText: {
    fontWeight: '700',
    color: colors.error,
  },
  input: {
    marginTop: spacing.xs,
  },
  deleteBtn: {
    marginTop: spacing.sm,
  },
});
