import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TaskCard } from '../../components/cards/TaskCard';
import { ReminderCard } from '../../components/cards/ReminderCard';
import { PrimaryButton, SecondaryButton } from '../../components/buttons';
import { TaskRepository } from '../../repositories/TaskRepository';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { TaskItem } from '../../services/api/taskApi';
import { ReminderItem } from '../../services/api/reminderApi';

type Props = NativeStackScreenProps<CalendarStackParamList, 'SelectedDate'>;

export const SelectedDateScreen: React.FC<Props> = ({ route, navigation }) => {
  const dateStr = route.params?.date || new Date().toISOString().substring(0, 10);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      TaskRepository.getTasks(),
      ReminderRepository.getReminders(),
    ])
      .then(([taskRes, reminderRes]) => {
        const dateTasks = taskRes.items.filter((t) => t.dueDate && t.dueDate.startsWith(dateStr));
        const dateReminders = reminderRes.items.filter(
          (r) => r.scheduledAt && r.scheduledAt.startsWith(dateStr)
        );
        setTasks(dateTasks);
        setReminders(dateReminders);
      })
      .catch(() => {
        setTasks([]);
        setReminders([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dateStr]);

  const formattedDate = (() => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  })();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title={formattedDate} onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : tasks.length === 0 && reminders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Schedule for this Date</Text>
            <Text style={styles.emptySubtitle}>You don't have any tasks or reminders scheduled.</Text>
            <View style={styles.emptyActions}>
              <PrimaryButton
                title="+ Add Task"
                onPress={() => navigation.navigate('TasksTab' as never)}
              />
              <SecondaryButton
                title="+ Add Reminder"
                onPress={() => navigation.navigate('AddReminder')}
              />
            </View>
          </View>
        ) : (
          <>
            {/* Scheduled Tasks Section */}
            {tasks.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>TASKS SCHEDULED ({tasks.length})</Text>
                <View style={styles.list}>
                  {tasks.map((item) => (
                    <TaskCard
                      key={item.id}
                      title={item.title}
                      description={item.description}
                      completed={item.status === 'completed'}
                      priority={item.priority}
                      category={item.category}
                      dueDate={item.dueDate ? new Date(item.dueDate).toLocaleDateString() : undefined}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {/* Scheduled Reminders Section */}
            {reminders.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>REMINDERS SCHEDULED ({reminders.length})</Text>
                <View style={styles.list}>
                  {reminders.map((item) => (
                    <ReminderCard
                      key={item.id}
                      title={item.title}
                      time={new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      date={new Date(item.scheduledAt).toLocaleDateString()}
                      category={item.type}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    paddingVertical: spacing['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    ...elevation.small,
  },
  emptyTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyActions: {
    width: '100%',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  list: {
    gap: spacing.sm,
  },
});
