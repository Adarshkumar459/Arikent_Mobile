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
import { TasksStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { PrimaryButton, SecondaryButton, DangerButton } from '../../components/buttons';
import { StatusChip, PriorityChip, CategoryChip } from '../../components/chips';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskItem } from '../../services/api/taskApi';
import { TaskOptionsSheet } from '../../components/sheets/TaskOptionsSheet';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskDetails'>;

export const TaskDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const taskId = route.params?.taskId;
  const [task, setTask] = useState<TaskItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const fetchTask = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const data = await TaskRepository.getTaskById(taskId);
      setTask(data);
    } catch (err) {
      setTask(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTask();
    });
    return unsubscribe;
  }, [navigation, taskId]);

  const handleToggleComplete = async () => {
    if (!task) return;
    try {
      if (task.status === 'completed') {
        const updated = await TaskRepository.updateTask(task.id, { status: 'pending' });
        setTask(updated);
      } else {
        const updated = await TaskRepository.completeTask(task.id);
        setTask(updated);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update task');
    }
  };

  const handleDelete = () => {
    if (!task) return;
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await TaskRepository.deleteTask(task.id);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete task');
          }
        },
      },
    ]);
  };

  const handleDuplicate = async () => {
    if (!task) return;
    try {
      await TaskRepository.createTask({
        title: `${task.title} (Copy)`,
        description: task.description,
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate,
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to duplicate task');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Task Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Task Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Task Details"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={() => setIsOptionsOpen(true)}>
            <Text style={styles.optionsIcon}>•••</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <StatusChip status={task.status as any} />
            <PriorityChip priority={task.priority as any} />
            <CategoryChip label={task.category} selected />
          </View>

          <Text style={styles.title}>{task.title}</Text>

          {task.description ? (
            <Text style={styles.description}>{task.description}</Text>
          ) : (
            <Text style={styles.noDesc}>No description provided.</Text>
          )}

          <View style={styles.metaDivider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Due Date:</Text>
            <Text style={styles.metaValue}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created:</Text>
            <Text style={styles.metaValue}>{new Date(task.createdAt).toLocaleDateString()}</Text>
          </View>

          {task.completedAt ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Completed:</Text>
              <Text style={styles.metaValue}>{new Date(task.completedAt).toLocaleDateString()}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title={task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
            onPress={handleToggleComplete}
          />
          <SecondaryButton
            title="Edit Task"
            onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
          />
          <DangerButton title="Delete Task" onPress={handleDelete} />
        </View>
      </ScrollView>

      <TaskOptionsSheet
        visible={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        onEdit={() => navigation.navigate('EditTask', { taskId: task.id })}
        onDuplicate={handleDuplicate}
        onMarkCompleted={handleToggleComplete}
        onDelete={handleDelete}
      />
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
  optionsIcon: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '700',
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
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  noDesc: {
    ...typography.bodySmall,
    color: colors.textDisabled,
    fontStyle: 'italic',
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
