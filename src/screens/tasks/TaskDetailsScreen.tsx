import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TasksStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskItem, TaskStatus } from '../../services/api/taskApi';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskDetails'>;

export const TaskDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params || {};
  const [task, setTask] = useState<TaskItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const data = await TaskRepository.getTaskById(taskId);
      setTask(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch task details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTaskDetails();
    });
    return unsubscribe;
  }, [navigation, taskId]);

  const handleToggleComplete = async () => {
    if (!taskId || !task) return;
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await TaskRepository.updateTask(taskId, { status: newStatus });
      setTask(updated);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskId) return;
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await TaskRepository.deleteTask(taskId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete task');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleSnooze = async () => {
    if (!taskId || !task) return;
    // Postpone due date by +3 hours
    const current = task.dueDate ? new Date(task.dueDate) : new Date();
    current.setHours(current.getHours() + 3);

    try {
      const updated = await TaskRepository.updateTask(taskId, { dueDate: current.toISOString() });
      setTask(updated);
      Alert.alert('Task Snoozed', 'Task postponed by 3 hours');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to snooze task');
    }
  };

  if (isLoading || !task) {
    return (
      <View style={styles.safeArea}>
        <ScreenHeader title="Task Details" />
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const isDone = task.status === 'completed';
  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not Scheduled';
  const formattedTime = task.dueDate
    ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'All Day';

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScreenHeader
        title="Task Details"
        rightAction={
          <TouchableOpacity onPress={handleDeleteTask} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <TouchableOpacity
            style={[styles.heroCheckBtn, isDone && styles.heroCheckBtnDone]}
            onPress={handleToggleComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.heroCheckIcon}>{isDone ? '✓' : '○'}</Text>
          </TouchableOpacity>

          <Text style={styles.heroTitle}>{task.title}</Text>

          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>
              ⏰ {isDone ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailVal}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>⏰</Text>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailVal}>{formattedTime}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🔄</Text>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Repeat</Text>
              <Text style={styles.detailVal}>{task.recurrence ? task.recurrence.toUpperCase() : 'Does not repeat'}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🏷️</Text>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailVal}>{task.category ? task.category.toUpperCase() : 'GENERAL'}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>⚠️</Text>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Priority</Text>
              <Text style={styles.detailVal}>{task.priority ? task.priority.toUpperCase() : 'MEDIUM'}</Text>
            </View>
          </View>

          {/* Description Box */}
          {task.description ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>Notes</Text>
              <Text style={styles.noteText}>{task.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.snoozeBtn} onPress={handleSnooze} activeOpacity={0.85}>
            <Text style={styles.snoozeBtnText}>💤 Snooze (+3h)</Text>
          </TouchableOpacity>

          <View style={styles.actionGridRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.editBtnText}>✏️ Edit Task</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteTask} activeOpacity={0.8}>
              <Text style={styles.deleteBtnText}>🗑️ Delete Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryCompleteBtn, isDone && styles.primaryCompleteBtnDone]}
          onPress={handleToggleComplete}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryCompleteBtnText}>
            ✓ {isDone ? 'Mark as Pending' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 90,
  },
  heroSection: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  heroCheckBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 3,
    borderColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.small,
  },
  heroCheckBtnDone: {
    backgroundColor: colors.primaryContainer,
  },
  heroCheckIcon: {
    fontSize: 32,
    color: colors.primaryContainer,
    fontWeight: '800',
  },
  heroTitle: {
    ...typography.heading2,
    fontSize: 22,
    color: colors.onSurface,
    fontWeight: '800',
    textAlign: 'center',
  },
  statusPill: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusPillText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    gap: spacing.md,
    ...elevation.small,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailIcon: {
    fontSize: 20,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.outline,
  },
  detailVal: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurface,
    fontWeight: '600',
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.surfaceContainerHighest,
  },
  noteBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 10,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  noteLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.outline,
    marginBottom: 2,
  },
  noteText: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurface,
  },
  secondaryActions: {
    gap: spacing.md,
  },
  snoozeBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snoozeBtnText: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },
  actionGridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  editBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    ...typography.heading4,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFDAD6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    ...typography.heading4,
    fontSize: 14,
    color: colors.error,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  primaryCompleteBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.small,
  },
  primaryCompleteBtnDone: {
    backgroundColor: colors.outline,
  },
  primaryCompleteBtnText: {
    ...typography.heading4,
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '700',
  },
});
