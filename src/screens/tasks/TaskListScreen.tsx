import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TasksStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskItem, TaskCategory, TaskPriority, TaskStatus } from '../../services/api/taskApi';
import { TaskOptionsSheet } from '../../components/sheets/TaskOptionsSheet';
import { useTabNav } from '../../context/TabContext';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskList'>;

const FILTER_TABS = ['All', 'Today', 'Upcoming', 'Completed'];

const CATEGORY_COLORS: Record<string, string> = {
  finance: '#6C4CE8',
  work: '#3B82F6',
  personal: '#10B981',
  home: '#F59E0B',
  health: '#EC4899',
  other: '#14B8A6',
};

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const { switchTab } = useTabNav();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Selected task for options sheet
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  const fetchTasks = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await TaskRepository.getTasks();
      setTasks(res.items);
    } catch (err: any) {
      console.log('Error fetching tasks:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks(tasks.length === 0);
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTasks(false);
  }, []);

  const handleToggleTaskStatus = async (item: TaskItem) => {
    const newStatus: TaskStatus = item.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await TaskRepository.updateTask(item.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === item.id ? updated : t)));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update task status');
    }
  };

  const handleOpenSheet = (item: TaskItem) => {
    setActiveTask(item);
    setIsSheetOpen(true);
  };

  const handleDeleteActiveTask = async () => {
    if (!activeTask) return;
    try {
      await TaskRepository.deleteTask(activeTask.id);
      setIsSheetOpen(false);
      fetchTasks(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete task');
    }
  };

  // Bento Metrics Computation
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayCount = tasks.filter((t) => {
    if (t.status === 'completed' || !t.dueDate) return false;
    return t.dueDate.startsWith(todayStr);
  }).length;

  const upcomingCount = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    if (!t.dueDate) return true;
    return new Date(t.dueDate).getTime() > Date.now();
  }).length;

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  // Filtered Tasks
  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'Today') {
      if (t.status === 'completed' || !t.dueDate) return false;
      return t.dueDate.startsWith(todayStr);
    }
    if (activeFilter === 'Upcoming') {
      if (t.status === 'completed') return false;
      if (!t.dueDate) return true;
      return new Date(t.dueDate).getTime() > Date.now();
    }
    if (activeFilter === 'Completed') {
      return t.status === 'completed';
    }
    return true;
  });

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScreenHeader
        title="Tasks"
        subtitle="Stay on top of what matters."
        onBackPress={() => switchTab('Home')}
      />

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {/* Bento Summary Cards */}
          <View style={styles.bentoGrid}>
            <View style={[styles.bentoCard, { borderColor: colors.primaryContainer + '40' }]}>
              <Text style={styles.bentoLabel}>DUE TODAY</Text>
              <Text style={[styles.bentoValue, { color: colors.primaryContainer }]}>
                {dueTodayCount}
              </Text>
            </View>

            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>UPCOMING</Text>
              <Text style={[styles.bentoValue, { color: colors.onSurface }]}>
                {upcomingCount}
              </Text>
            </View>

            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>COMPLETED</Text>
              <Text style={[styles.bentoValue, { color: colors.outline }]}>
                {completedCount}
              </Text>
            </View>
          </View>

          {/* Filter Pills Bar */}
          <View style={styles.filterBar}>
            {FILTER_TABS.map((tab) => {
              const active = activeFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setActiveFilter(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Task Cards List */}
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No tasks found for "{activeFilter}"</Text>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {filteredTasks.map((item) => {
                const isDone = item.status === 'completed';
                const catKey = (item.category || 'other').toLowerCase();
                const accentColor = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.other;

                const isHigh = item.priority === 'high';
                const isMedium = item.priority === 'medium';
                const priorityColor = isHigh ? colors.error : isMedium ? '#F59E0B' : '#14B8A6';

                const formattedDate = item.dueDate
                  ? new Date(item.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'No Schedule';

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.taskCard,
                      { borderLeftColor: isHigh ? colors.error : accentColor },
                      isDone && styles.taskCardDone,
                    ]}
                    onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
                    onLongPress={() => handleOpenSheet(item)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.cardRow}>
                      {/* Checkbox */}
                      <TouchableOpacity
                        style={[styles.checkbox, isDone && styles.checkboxDone]}
                        onPress={() => handleToggleTaskStatus(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {isDone ? <Text style={styles.checkboxCheck}>✓</Text> : null}
                      </TouchableOpacity>

                      <View style={styles.cardContent}>
                        <View style={styles.cardTitleRow}>
                          <Text
                            style={[styles.taskTitle, isDone && styles.taskTitleDone]}
                            numberOfLines={2}
                          >
                            {item.title}
                          </Text>

                          <TouchableOpacity
                            onPress={() => handleOpenSheet(item)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Text style={styles.moreIcon}>•••</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Timing Schedule Text */}
                        <View style={styles.scheduleRow}>
                          <Text style={{ fontSize: 13, marginRight: 4 }}>⏰</Text>
                          <Text style={[styles.scheduleText, isHigh && { color: colors.error }]}>
                            {formattedDate}
                          </Text>
                        </View>

                        {/* Badges Row */}
                        <View style={styles.badgesRow}>
                          <View style={[styles.catBadge, { backgroundColor: accentColor + '20' }]}>
                            <Text style={[styles.catBadgeText, { color: accentColor }]}>
                              {item.category ? item.category.toUpperCase() : 'GENERAL'}
                            </Text>
                          </View>

                          {item.priority ? (
                            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                              <Text style={[styles.priorityBadgeText, { color: priorityColor }]}>
                                ⚠️ {item.priority.toUpperCase()}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Add Task CTA */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Contextual Action Sheet */}
      <TaskOptionsSheet
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onEdit={() => {
          setIsSheetOpen(false);
          if (activeTask) navigation.navigate('EditTask', { taskId: activeTask.id });
        }}
        onDelete={handleDeleteActiveTask}
      />
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
    paddingBottom: 80,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...elevation.small,
  },
  bentoLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.outline,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bentoValue: {
    ...typography.display,
    fontSize: 26,
    fontWeight: '800',
  },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  filterChipActive: {
    backgroundColor: colors.primaryContainer,
  },
  filterChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: colors.textLight,
    fontWeight: '600',
  },
  tasksList: {
    gap: spacing.md,
  },
  taskCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...elevation.small,
  },
  taskCardDone: {
    opacity: 0.65,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  checkboxCheck: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.xs,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.outline,
  },
  moreIcon: {
    fontSize: 16,
    color: colors.outline,
    letterSpacing: -1,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  catBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  priorityBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.outline,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.large,
  },
  fabText: {
    color: colors.surface,
    fontSize: 32,
    fontWeight: '400',
    marginTop: -3,
  },
});
