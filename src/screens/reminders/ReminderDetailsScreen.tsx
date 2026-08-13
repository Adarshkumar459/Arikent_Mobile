import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { PrimaryButton, DangerButton } from '../../components/buttons';
import { useCustomAlert } from '../../components/alerts/CustomAlert';
import { StatusChip, CategoryChip } from '../../components/chips';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { ReminderItem } from '../../services/api/reminderApi';

type Props = NativeStackScreenProps<CalendarStackParamList, 'ReminderDetails'>;

export const ReminderDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { reminderId } = route.params;
  const [reminder, setReminder] = useState<ReminderItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showAlert, CustomAlertModal } = useCustomAlert();

  const fetchReminderDetails = async () => {
    if (!reminderId) return;
    try {
      const data = await ReminderRepository.getReminderById(reminderId);
      setReminder(data);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminderDetails();
  }, [reminderId]);

  const handleToggleComplete = async () => {
    if (!reminder) return;
    try {
      const newStatus = reminder.status === 'completed' ? 'scheduled' : 'completed';
      const updated = await ReminderRepository.updateReminder(reminder.id, { status: newStatus });
      setReminder(updated);
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to update reminder status', 'error');
    }
  };

  const handleDelete = () => {
    if (!reminder) return;
    showAlert('Delete Reminder', 'Are you sure you want to delete this reminder?', 'warning', [
      { text: 'Cancel', variant: 'secondary' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await ReminderRepository.deleteReminder(reminder.id);
            navigation.goBack();
          } catch (err: any) {
            showAlert('Error', err.message || 'Failed to delete reminder', 'error');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Reminder Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!reminder) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Reminder Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Reminder not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Reminder Details" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <StatusChip status={reminder.status as any} />
            <CategoryChip label={reminder.type} selected />
          </View>

          <Text style={styles.title}>{reminder.title}</Text>

          <View style={styles.metaDivider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Scheduled Date:</Text>
            <Text style={styles.metaValue}>{new Date(reminder.scheduledAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Scheduled Time:</Text>
            <Text style={styles.metaValue}>
              {new Date(reminder.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created:</Text>
            <Text style={styles.metaValue}>{new Date(reminder.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title={reminder.status === 'completed' ? 'Mark as Scheduled' : 'Mark as Completed'}
            onPress={handleToggleComplete}
          />
          <DangerButton title="Delete Reminder" onPress={handleDelete} />
        </View>
      </ScrollView>
      <CustomAlertModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...elevation.small,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  metaDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
});
