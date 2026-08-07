import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { TaskRepository } from '../repositories/TaskRepository';
import { TaskItem, TaskStatus } from '../services/api/taskApi';
import { colors, spacing, typography, radius, elevation } from '../theme';
import { Button } from '../components/buttons/Button';
import { Loading } from '../components/feedback/Loading';
import { EmptyState } from '../components/feedback/EmptyState';
import { Logo } from '../components/brand/Logo';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<TaskStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTasks = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = activeFilter !== 'all' ? { status: activeFilter } : undefined;
      const data = await TaskRepository.getTasks(params);
      setTasks(data.items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks();
    });
    return unsubscribe;
  }, [navigation, activeFilter]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTasks(false);
  }, [activeFilter]);

  const handleToggleComplete = async (task: TaskItem) => {
    try {
      if (task.status === 'completed') {
        await TaskRepository.updateTask(task.id, { status: 'pending' });
      } else {
        await TaskRepository.completeTask(task.id);
      }
      fetchTasks(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update task status');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + spacing.xs, spacing.md) }]}>
        <View style={styles.headerLeft}>
          <Logo size="sm" imageSource={require('../../assets/arkient-logo.png')} />
          <View style={styles.greetingWrapper}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userNameText}>{user?.name || 'User'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + spacing.md, spacing.xl) }]}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Tasks Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Action Bar */}
        <View style={styles.actionHeader}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          <Button
            variant="primary"
            label="+ Add Task"
            onPress={() => navigation.navigate('CreateTask')}
            style={styles.addTaskBtn}
          />
        </View>

        {/* Filter Segmented Bar */}
        <View style={styles.filterBar}>
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((filterKey) => (
            <TouchableOpacity
              key={filterKey}
              style={[
                styles.filterTab,
                activeFilter === filterKey && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(filterKey)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === filterKey && styles.filterTabTextActive,
                ]}
              >
                {filterKey === 'all'
                  ? 'All'
                  : filterKey === 'in_progress'
                  ? 'In Progress'
                  : filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Error Banner */}
        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
            <Button variant="secondary" label="Retry" onPress={() => fetchTasks()} style={styles.retryBtn} />
          </View>
        ) : null}

        {/* Loading Indicator */}
        {isLoading ? (
          <Loading message="Fetching your tasks..." />
        ) : tasks.length === 0 ? (
          /* Empty State */
          <EmptyState
            title="No tasks found"
            description="Add your first task and start organizing your day effortlessly."
            actionLabel="+ Add Task"
            onAction={() => navigation.navigate('CreateTask')}
          />
        ) : (
          /* Task List */
          <View style={styles.taskList}>
            {tasks.map((item) => {
              const isDone = item.status === 'completed';
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.taskCard}
                  onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
                >
                  <View style={styles.taskCardHeader}>
                    <TouchableOpacity
                      style={[styles.checkbox, isDone && styles.checkboxChecked]}
                      onPress={() => handleToggleComplete(item)}
                    >
                      {isDone ? <Text style={styles.checkmark}>✓</Text> : null}
                    </TouchableOpacity>

                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                        {item.title}
                      </Text>
                      {item.description ? (
                        <Text style={styles.taskDescription} numberOfLines={1}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.taskCardFooter}>
                    <View style={styles.badgeRow}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
                      </View>

                      <View
                        style={[
                          styles.priorityBadge,
                          item.priority === 'high'
                            ? styles.priorityHigh
                            : item.priority === 'medium'
                            ? styles.priorityMed
                            : styles.priorityLow,
                        ]}
                      >
                        <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
                      </View>
                    </View>

                    {item.dueDate ? (
                      <Text style={styles.dueDateText}>
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  greetingWrapper: {
    justifyContent: 'center',
  },
  greetingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  userNameText: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.small,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...elevation.small,
  },
  summaryTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.display,
    color: colors.primary,
    fontSize: 28,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  addTaskBtn: {
    paddingHorizontal: spacing.md,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.xs,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  errorBannerText: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  retryBtn: {
    marginTop: spacing.xs,
  },
  taskList: {
    gap: spacing.md,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...elevation.small,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  categoryBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  categoryText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  priorityLow: {
    backgroundColor: '#E0F2FE',
  },
  priorityMed: {
    backgroundColor: '#FEF3C7',
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dueDateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
