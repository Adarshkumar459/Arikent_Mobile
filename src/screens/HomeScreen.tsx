import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { DashboardRepository } from '../repositories/DashboardRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { DashboardData, CalendarDayData } from '../services/api/dashboardApi';
import { TaskItem } from '../services/api/taskApi';
import { colors, spacing, typography, radius, elevation } from '../theme';
import { Button } from '../components/buttons/Button';
import { Logo } from '../components/brand/Logo';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calendar State
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState<TaskItem[] | null>(null);
  const [isLoadingDateTasks, setIsLoadingDateTasks] = useState<boolean>(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const fetchDashboard = async (showLoading = true, monthParam?: string) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await DashboardRepository.getDashboard({
        month: monthParam || currentYearMonth,
      });
      setDashboardData(data);

      // If selectedDate is unset, default to today's date from backend
      if (!selectedDate && data.date) {
        setSelectedDate(data.date);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load your dashboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDashboard(dashboardData === null);
    });
    return unsubscribe;
  }, [navigation, currentYearMonth]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchDashboard(false, currentYearMonth);
  }, [currentYearMonth]);

  // Handle month change in calendar
  const handlePrevMonth = () => {
    const [yStr, mStr] = currentYearMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    const newMonthStr = `${y}-${String(m).padStart(2, '0')}`;
    setCurrentYearMonth(newMonthStr);
    setSelectedDate(null);
    setSelectedDateTasks(null);
    fetchDashboard(true, newMonthStr);
  };

  const handleNextMonth = () => {
    const [yStr, mStr] = currentYearMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    const newMonthStr = `${y}-${String(m).padStart(2, '0')}`;
    setCurrentYearMonth(newMonthStr);
    setSelectedDate(null);
    setSelectedDateTasks(null);
    fetchDashboard(true, newMonthStr);
  };

  // Handle selecting a specific date on the calendar
  const handleSelectDate = async (dateStr: string) => {
    setSelectedDate(dateStr);
    if (dashboardData && dateStr === dashboardData.date) {
      setSelectedDateTasks(null); // Show default todayTasks
      return;
    }

    setIsLoadingDateTasks(true);
    try {
      // Fetch tasks for the selected date
      const res = await TaskRepository.getTasks();
      const filtered = res.items.filter((t) => {
        if (t.dueDate) {
          return t.dueDate.startsWith(dateStr);
        }
        return false;
      });
      setSelectedDateTasks(filtered);
    } catch (err) {
      setSelectedDateTasks([]);
    } finally {
      setIsLoadingDateTasks(false);
    }
  };

  // Toggle complete task
  const handleToggleComplete = async (task: TaskItem) => {
    setCompletingTaskId(task.id);
    try {
      if (task.status === 'completed') {
        await TaskRepository.updateTask(task.id, { status: 'pending' });
      } else {
        await TaskRepository.completeTask(task.id);
      }
      await fetchDashboard(false, currentYearMonth);
      if (selectedDate && selectedDate !== dashboardData?.date) {
        handleSelectDate(selectedDate);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update task status');
    } finally {
      setCompletingTaskId(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate calendar days grid
  const renderCalendarGrid = () => {
    const [yearStr, monthStr] = currentYearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const calendarMap = new Map<string, CalendarDayData>();
    dashboardData?.calendar.forEach((c) => calendarMap.set(c.date, c));

    const gridItems = [];
    // Padding days before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      gridItems.push(<View key={`blank-${i}`} style={styles.calendarDayEmpty} />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDay = String(day).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${formattedDay}`;
      const dayData = calendarMap.get(dateStr);
      const isSelected = selectedDate === dateStr;
      const isToday = dashboardData?.date === dateStr;
      const hasTasks = dayData?.hasTasks || false;

      gridItems.push(
        <TouchableOpacity
          key={dateStr}
          style={[
            styles.calendarDayCell,
            isToday && styles.calendarDayToday,
            isSelected && styles.calendarDaySelected,
          ]}
          onPress={() => handleSelectDate(dateStr)}
        >
          <Text
            style={[
              styles.calendarDayText,
              isToday && styles.calendarDayTodayText,
              isSelected && styles.calendarDaySelectedText,
            ]}
          >
            {day}
          </Text>
          {hasTasks ? (
            <View
              style={[
                styles.taskDot,
                isSelected && styles.taskDotSelected,
              ]}
            />
          ) : (
            <View style={styles.taskDotPlaceholder} />
          )}
        </TouchableOpacity>
      );
    }

    return gridItems;
  };

  const displayTasks: TaskItem[] =
    selectedDateTasks !== null
      ? selectedDateTasks
      : dashboardData?.todayTasks || [];

  const monthFormatted = (() => {
    const [yStr, mStr] = currentYearMonth.split('-');
    const dateObj = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, 1);
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  })();

  const isTodaySelected = !selectedDate || selectedDate === dashboardData?.date;

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
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + spacing.md, spacing.xl) },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Error Banner */}
        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Button
              variant="secondary"
              label="Retry"
              onPress={() => fetchDashboard(true, currentYearMonth)}
              style={styles.retryBtn}
            />
          </View>
        ) : null}

        {/* Loading State */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your productivity dashboard...</Text>
          </View>
        ) : dashboardData ? (
          <>
            {/* Today Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={styles.summaryCardTitle}>Today's Overview</Text>
                  <Text style={styles.summarySubtitle}>
                    {dashboardData.summary.total === 0
                      ? 'No tasks created yet'
                      : `${dashboardData.summary.completed} of ${dashboardData.summary.total} tasks completed`}
                  </Text>
                </View>
                <View style={styles.rateBadge}>
                  <Text style={styles.rateBadgeText}>
                    {dashboardData.summary.completionRate}% Done
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min(dashboardData.summary.completionRate, 100)}%` },
                  ]}
                />
              </View>

              {/* Stat Counters */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{dashboardData.summary.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: colors.warning }]}>
                    {dashboardData.summary.pending}
                  </Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: colors.info }]}>
                    {dashboardData.summary.inProgress}
                  </Text>
                  <Text style={styles.statLabel}>In Progress</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: colors.success }]}>
                    {dashboardData.summary.completed}
                  </Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>
            </View>

            {/* Interactive Calendar Section */}
            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>{monthFormatted}</Text>
                <View style={styles.calendarNavButtons}>
                  <TouchableOpacity
                    style={styles.navArrowBtn}
                    onPress={handlePrevMonth}
                  >
                    <Text style={styles.navArrowText}>‹</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navArrowBtn}
                    onPress={handleNextMonth}
                  >
                    <Text style={styles.navArrowText}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Weekday headers */}
              <View style={styles.weekdayRow}>
                {WEEKDAYS.map((day) => (
                  <Text key={day} style={styles.weekdayText}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>{renderCalendarGrid()}</View>
            </View>

            {/* Action Bar Header */}
            <View style={styles.actionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  {isTodaySelected ? "Today's Tasks" : `Tasks for ${selectedDate}`}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {displayTasks.length} {displayTasks.length === 1 ? 'task' : 'tasks'} scheduled
                </Text>
              </View>
              <Button
                variant="primary"
                label="+ Add Task"
                onPress={() => navigation.navigate('CreateTask')}
                style={styles.addTaskBtn}
              />
            </View>

            {/* Task List / Empty States */}
            {isLoadingDateTasks ? (
              <View style={styles.dateLoadingBox}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : displayTasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  {dashboardData.summary.total === 0
                    ? 'No tasks yet'
                    : isTodaySelected
                    ? "You're all caught up!"
                    : 'No tasks for this day'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {dashboardData.summary.total === 0
                    ? 'Create your first task and start organizing your day effortlessly.'
                    : 'Enjoy your free time or add a new task for this day.'}
                </Text>
                <Button
                  variant="secondary"
                  label="+ Add Task"
                  onPress={() => navigation.navigate('CreateTask')}
                  style={styles.emptyActionBtn}
                />
              </View>
            ) : (
              <View style={styles.taskList}>
                {displayTasks.map((item) => {
                  const isDone = item.status === 'completed';
                  const isCompleting = completingTaskId === item.id;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.taskCard}
                      onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
                      activeOpacity={0.8}
                    >
                      <View style={styles.taskCardHeader}>
                        <TouchableOpacity
                          style={[
                            styles.checkbox,
                            isDone && styles.checkboxChecked,
                            isCompleting && styles.checkboxDisabled,
                          ]}
                          disabled={isCompleting}
                          onPress={() => handleToggleComplete(item)}
                        >
                          {isCompleting ? (
                            <ActivityIndicator size="small" color={isDone ? '#FFF' : colors.primary} />
                          ) : isDone ? (
                            <Text style={styles.checkmark}>✓</Text>
                          ) : null}
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

            {/* Upcoming Tasks Section */}
            <View style={styles.upcomingSection}>
              <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
              {dashboardData.upcomingTasks.length === 0 ? (
                <View style={styles.emptyUpcomingCard}>
                  <Text style={styles.emptyUpcomingText}>You're all caught up — No upcoming tasks scheduled.</Text>
                </View>
              ) : (
                <View style={styles.upcomingList}>
                  {dashboardData.upcomingTasks.map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      style={styles.upcomingCard}
                      onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
                      activeOpacity={0.8}
                    >
                      <View style={styles.upcomingLeft}>
                        <Text style={styles.upcomingTitle} numberOfLines={1}>
                          {task.title}
                        </Text>
                        <Text style={styles.upcomingCategory}>
                          {task.category.toUpperCase()} • {task.priority.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.upcomingDateBadge}>
                        <Text style={styles.upcomingDateText}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Soon'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}
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
    width: 42,
    height: 42,
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
  loadingContainer: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  retryBtn: {
    marginTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...elevation.small,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryCardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  summarySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rateBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  rateBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
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
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  calendarCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...elevation.small,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  calendarTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  calendarNavButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: -2,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayEmpty: {
    width: '14.28%',
    height: 40,
  },
  calendarDayCell: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  calendarDayToday: {
    backgroundColor: colors.primaryLight,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
  },
  calendarDayText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  calendarDayTodayText: {
    color: colors.primary,
    fontWeight: '700',
  },
  calendarDaySelectedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  taskDot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  taskDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  taskDotPlaceholder: {
    height: 7,
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
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addTaskBtn: {
    paddingHorizontal: spacing.md,
  },
  dateLoadingBox: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...elevation.small,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyActionBtn: {
    paddingHorizontal: spacing.lg,
  },
  taskList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
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
  checkboxDisabled: {
    opacity: 0.6,
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
  upcomingSection: {
    marginTop: spacing.md,
  },
  emptyUpcomingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  emptyUpcomingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  upcomingList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  upcomingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...elevation.small,
  },
  upcomingLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  upcomingTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  upcomingCategory: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  upcomingDateBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  upcomingDateText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
});
