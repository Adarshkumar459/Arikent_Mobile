import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskItem } from '../../services/api/taskApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskDetails'>;

export const TaskDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { taskId } = route.params;
  const [task, setTask] = useState<TaskItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTaskDetails = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await TaskRepository.getTaskById(taskId);
      setTask(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Task not found');
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

  const handleMarkComplete = async () => {
    if (!task) return;
    setIsCompleting(true);
    try {
      const updated = await TaskRepository.completeTask(task.id);
      setTask(updated);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to complete task');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ]
    );
  };

  const performDelete = async () => {
    if (!task) return;
    setIsDeleting(true);
    try {
      await TaskRepository.deleteTask(task.id);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete task');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading task details..." />;
  }

  if (errorMsg || !task) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg || 'Task not found'}</Text>
        <Button variant="secondary" label="Go Back" onPress={() => navigation.goBack()} style={styles.retryButton} />
      </View>
    );
  }

  const isCompleted = task.status === 'completed';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.statusBadge, isCompleted ? styles.statusCompleted : styles.statusPending]}>
            <Text style={[styles.statusText, isCompleted ? styles.statusCompletedText : styles.statusPendingText]}>
              {task.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>PRIORITY: {task.priority.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.title}>{task.title}</Text>

        {task.description ? <Text style={styles.description}>{task.description}</Text> : null}

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Category:</Text>
          <Text style={styles.metaValue}>{task.category.toUpperCase()}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Due Date:</Text>
          <Text style={styles.metaValue}>
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
          </Text>
        </View>

        {task.recurrence ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Recurrence:</Text>
            <Text style={styles.metaValue}>
              {task.recurrence.frequency.toUpperCase()} (Every {task.recurrence.interval || 1})
            </Text>
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Created At:</Text>
          <Text style={styles.metaValue}>{new Date(task.createdAt).toLocaleString()}</Text>
        </View>

        {task.completedAt ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Completed At:</Text>
            <Text style={styles.metaValue}>{new Date(task.completedAt).toLocaleString()}</Text>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actionGroup}>
        {!isCompleted ? (
          <View style={styles.actionRow}>
            <Button
              variant="primary"
              label="Mark Complete"
              isLoading={isCompleting}
              onPress={handleMarkComplete}
            />
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <Button
            variant="secondary"
            label="Edit Task"
            onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
          />
        </View>

        <View style={styles.actionRow}>
          <Button
            variant="danger"
            label="Delete Task"
            isLoading={isDeleting}
            onPress={handleDeleteConfirm}
          />
        </View>
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
    padding: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    ...elevation.medium,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  statusPendingText: {
    color: '#D97706',
  },
  statusCompletedText: {
    color: '#059669',
  },
  priorityBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  priorityText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  metaLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  metaValue: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionGroup: {
    gap: spacing.sm,
  },
  actionRow: {
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.md,
  },
  retryButton: {
    minWidth: 120,
  },
});
