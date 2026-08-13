import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { DashboardRepository } from '../repositories/DashboardRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { DashboardData, CalendarDayData } from '../services/api/dashboardApi';
import { TaskItem } from '../services/api/taskApi';
import { colors, spacing, typography, radius, elevation } from '../theme';
import { Button } from '../components/buttons/Button';
import { Logo } from '../components/brand/Logo';
import { useTabNav } from '../context/TabContext';

type Props = NativeStackScreenProps<any, 'Home'>;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Shimmer component for loading skeleton state
const SkeletonBlock: React.FC<{ style?: any }> = ({ style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });

  return <Animated.View style={[styles.skeletonBase, { opacity }, style]} />;
};

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { switchTab } = useTabNav();

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

  const handleSelectDate = async (dateStr: string) => {
    setSelectedDate(dateStr);
    if (dashboardData && dateStr === dashboardData.date) {
      setSelectedDateTasks(null);
      return;
    }

    setIsLoadingDateTasks(true);
    try {
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

  const getFormattedTodayDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderCalendarGrid = () => {
    const [yearStr, monthStr] = currentYearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const calendarMap = new Map<string, CalendarDayData>();
    dashboardData?.calendar?.forEach((c: CalendarDayData) => calendarMap.set(c.date, c));

    const gridItems = [];
    for (let i = 0; i < firstDayIndex; i++) {
      gridItems.push(<View key={`blank-${i}`} style={styles.calendarDayEmpty} />);
    }

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
          activeOpacity={0.7}
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

  const displayTasks: any[] =
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
      {/* TopAppBar (Stitch Arkient Spec) */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0) + spacing.xs },
        ]}
      >
        <View style={styles.headerLeft}>
          <Logo size="sm" imageSource={require('../../assets/arkient-logo.png')} />
          <Text style={styles.brandTitleText}>ARKIENT</Text>
        </View>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => switchTab('Profile')}
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
            tintColor={colors.primary}
          />
        }
      >
        {/* User Greeting Header */}
        <View style={styles.greetingHeader}>
          <Text style={styles.greetingTitle}>
            {getGreeting()}, {user?.name || 'User'}
          </Text>
          <Text style={styles.greetingDate}>{getFormattedTodayDate()}</Text>
        </View>

        {/* State B: Error Banner */}
        {errorMsg ? (
          <View style={styles.errorCard}>
            <View style={styles.errorIconBox}>
              <Text style={styles.errorIconSymbol}>☁️</Text>
            </View>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Unable to load your dashboard</Text>
              <Text style={styles.errorSubtitle}>{errorMsg}</Text>
            </View>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchDashboard(true, currentYearMonth)}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* State C: Loading Skeleton State */}
        {isLoading && !isRefreshing ? (
          <View style={styles.skeletonWrapper}>
            <SkeletonBlock style={{ height: 160, borderRadius: radius.xl, marginBottom: spacing.lg }} />
            <SkeletonBlock style={{ height: 56, borderRadius: radius.lg, marginBottom: spacing.lg }} />
            <SkeletonBlock style={{ height: 120, borderRadius: radius.xl, marginBottom: spacing.lg }} />
            <SkeletonBlock style={{ height: 200, borderRadius: radius.xl }} />
          </View>
        ) : dashboardData ? (
          <>
            {/* Today's Summary Card (Hero Bento Card) */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryDecorCircle} />
              
              <View style={styles.summaryLeftCol}>
                <Text style={styles.summaryCardTitle}>Today's Summary</Text>

                <View style={styles.summaryGrid}>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatNum}>{dashboardData.summary.total}</Text>
                    <Text style={styles.summaryStatLabel}>Total</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatNum}>{dashboardData.summary.pending}</Text>
                    <Text style={styles.summaryStatLabel}>Pending</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatNum}>{dashboardData.summary.inProgress}</Text>
                    <Text style={styles.summaryStatLabel}>In Progress</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatNum}>{dashboardData.summary.completed}</Text>
                    <Text style={styles.summaryStatLabel}>Completed</Text>
                  </View>
                </View>
              </View>

              {/* Circular Completion Ring */}
              <View style={styles.ringContainer}>
                <View style={styles.ringOuterTrack}>
                  <View style={styles.ringInnerCenter}>
                    <Text style={styles.ringPercentText}>
                      {dashboardData.summary.completionRate}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Action & Goals Overview Row */}
            <View style={styles.quickActionRow}>
              <TouchableOpacity
                style={styles.primaryAddBtn}
                onPress={() => navigation.navigate('AddTask')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryAddBtnIcon}>+</Text>
                <Text style={styles.primaryAddBtnText}>Add Task</Text>
              </TouchableOpacity>

              {dashboardData.goals ? (
                <View style={styles.goalsMiniCard}>
                  <View style={styles.goalsMiniLeft}>
                    <View style={styles.flagIconBox}>
                      <Text style={styles.flagIconSymbol}>🚩</Text>
                    </View>
                    <Text style={styles.goalsMiniText}>
                      {dashboardData.goals.active || 0} Active Goals
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => switchTab('Goals')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewGoalsLink}>View Goals</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            {/* Today's Tasks Preview Section */}
            <View style={styles.tasksSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  {isTodaySelected ? "Today's Tasks" : `Tasks for ${selectedDate}`}
                </Text>
                <TouchableOpacity onPress={() => switchTab('Tasks')} activeOpacity={0.7}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {isLoadingDateTasks ? (
                <View style={styles.dateLoadingBox}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : displayTasks.length === 0 ? (
                /* State A: Welcome / Empty State */
                <View style={styles.emptyBentoCard}>
                  <View style={styles.emptyRocketBadge}>
                    <Text style={styles.rocketIcon}>🚀</Text>
                  </View>
                  <Text style={styles.emptyBentoTitle}>Welcome to ARKIENT</Text>
                  <Text style={styles.emptyBentoSubtitle}>
                    {dashboardData.summary.total === 0
                      ? 'Your dashboard is empty. Start your journey by defining your objectives and actions.'
                      : 'You are all caught up! Enjoy your day or schedule a new task.'}
                  </Text>
                  <View style={styles.emptyActionRow}>
                    <TouchableOpacity
                      style={styles.emptyAddBtn}
                      onPress={() => switchTab('Tasks')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.emptyAddBtnText}>+ Add Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.emptyGoalBtn}
                      onPress={() => switchTab('Goals')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.emptyGoalBtnText}>🚩 Create Goal</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.taskList}>
                  {displayTasks.map((item) => {
                    const isDone = item.status === 'completed';
                    const isCompleting = completingTaskId === item.id;
                    const accentColor =
                      item.priority === 'high'
                        ? colors.error
                        : item.priority === 'medium'
                        ? colors.secondary
                        : colors.tertiary;
                    const isHighPriority = item.priority === 'high';

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.taskItemCard, { borderLeftColor: accentColor }]}
                        onPress={() => {
                          switchTab('Tasks');
                          try {
                            navigation.navigate('TasksTab', { screen: 'TaskDetails', params: { taskId: item.id } });
                          } catch {
                            navigation.navigate('TaskDetails', { taskId: item.id });
                          }
                        }}
                        activeOpacity={0.87}
                      >
                        {/* Circle checkbox */}
                        <TouchableOpacity
                          style={[
                            styles.checkboxCircle,
                            isDone && styles.checkboxCircleChecked,
                            isCompleting && styles.checkboxCircleDisabled,
                          ]}
                          disabled={isCompleting}
                          onPress={() => handleToggleComplete(item)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          {isCompleting ? (
                            <ActivityIndicator size="small" color={isDone ? '#FFF' : colors.primary} />
                          ) : isDone ? (
                            <Text style={styles.checkmarkSymbol}>✓</Text>
                          ) : null}
                        </TouchableOpacity>

                        {/* Task body */}
                        <View style={styles.taskItemBody}>
                          <Text
                            style={[styles.taskItemTitle, isDone && styles.taskItemTitleDone]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>

                          <View style={styles.taskMetaRow}>
                            {/* Category chip — red tinted for high priority */}
                            <View
                              style={[
                                styles.categoryChip,
                                isHighPriority && styles.categoryChipHighPriority,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.categoryChipText,
                                  isHighPriority && styles.categoryChipHighPriorityText,
                                ]}
                              >
                                {isHighPriority ? 'High Priority' : item.category.toUpperCase()}
                              </Text>
                            </View>

                            {item.dueDate ? (
                              <Text
                                style={[
                                  styles.scheduleText,
                                  isHighPriority && styles.scheduleTextError,
                                ]}
                              >
                                ⏰{'  '}
                                {new Date(item.dueDate).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Interactive Calendar Section */}
            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>{monthFormatted}</Text>
                <View style={styles.calendarNavButtons}>
                  <TouchableOpacity
                    style={styles.navArrowBtn}
                    onPress={handlePrevMonth}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.navArrowText}>‹</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navArrowBtn}
                    onPress={handleNextMonth}
                    activeOpacity={0.7}
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

            {/* Upcoming Tasks Section */}
            <View style={styles.upcomingSection}>
              <Text style={styles.upcomingSectionLabel}>Upcoming</Text>
              {(dashboardData.upcomingTasks || []).length === 0 ? (
                <View style={styles.emptyUpcomingCard}>
                  <Text style={styles.emptyUpcomingText}>No upcoming tasks scheduled.</Text>
                </View>
              ) : (
                <View style={styles.upcomingList}>
                  {(dashboardData.upcomingTasks || []).map((task: any) => (
                    <TouchableOpacity
                      key={task.id || task._id}
                      style={styles.upcomingCard}
                      onPress={() => {
                        switchTab('Tasks');
                        try {
                          navigation.navigate('TasksTab', { screen: 'TaskDetails', params: { taskId: task.id } });
                        } catch {
                          navigation.navigate('TaskDetails', { taskId: task.id });
                        }
                      }}
                      activeOpacity={0.82}
                    >
                      <View style={styles.upcomingDot} />
                      <View style={styles.upcomingLeft}>
                        <Text style={styles.upcomingTitle} numberOfLines={1}>
                          {task.title}
                        </Text>
                        <Text style={styles.upcomingCategory}>
                          {task.category ? task.category.toUpperCase() : ''}
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
    borderBottomColor: colors.surfaceContainerHighest,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandTitleText: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.small,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  greetingHeader: {
    marginBottom: spacing.md,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
    lineHeight: 30,
  },
  greetingDate: {
    fontSize: 14,
    color: colors.outline,
    marginTop: 2,
  },
  skeletonWrapper: {
    gap: spacing.md,
  },
  skeletonBase: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  errorCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.errorContainer,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...elevation.small,
  },
  errorIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconSymbol: {
    fontSize: 22,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  errorSubtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface,
  },
  summaryCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryDecorCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF',
    opacity: 0.12,
  },
  summaryLeftCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  summaryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onPrimaryContainer,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryStatItem: {
    width: '45%',
  },
  summaryStatNum: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: colors.onPrimaryContainer,
    opacity: 0.8,
  },
  ringContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuterTrack: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInnerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textLight,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  primaryAddBtn: {
    flex: 1,
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryAddBtnIcon: {
    fontSize: 22,
    color: colors.textLight,
    fontWeight: '600',
  },
  primaryAddBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
  },
  goalsMiniCard: {
    flex: 1,
    height: 52,
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...elevation.small,
  },
  goalsMiniLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flagIconBox: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagIconSymbol: {
    fontSize: 14,
  },
  goalsMiniText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface,
  },
  viewGoalsLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  tasksSection: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.outline,
  },
  dateLoadingBox: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptyBentoCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    ...elevation.small,
  },
  emptyRocketBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  rocketIcon: {
    fontSize: 32,
  },
  emptyBentoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  emptyBentoSubtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  emptyActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  emptyAddBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAddBtnText: {
    color: colors.onPrimaryContainer,
    fontWeight: '600',
    fontSize: 13,
  },
  emptyGoalBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGoalBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  taskList: {
    gap: spacing.sm,
  },
  taskItemCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderColor: colors.border,
    borderWidth: 1,
    ...elevation.small,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxCircleChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxCircleDisabled: {
    opacity: 0.6,
  },
  checkmarkSymbol: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  taskItemBody: {
    flex: 1,
  },
  taskItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  taskItemTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.outline,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  categoryChip: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.xs + 4,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  categoryChipHighPriority: {
    backgroundColor: colors.errorContainer,
  },
  categoryChipHighPriorityText: {
    color: colors.onErrorContainer,
  },
  scheduleText: {
    fontSize: 11,
    color: colors.outline,
  },
  scheduleTextError: {
    color: colors.error,
    fontWeight: '600',
  },
  calendarCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    ...elevation.small,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  calendarNavButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onSurface,
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
    fontSize: 12,
    color: colors.outline,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayEmpty: {
    width: '14.28%',
    height: 38,
  },
  calendarDayCell: {
    width: '14.28%',
    height: 38,
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
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface,
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
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  taskDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  taskDotPlaceholder: {
    height: 6,
  },
  upcomingSection: {
    marginBottom: spacing.lg,
  },
  upcomingSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  emptyUpcomingCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    opacity: 0.7,
  },
  emptyUpcomingText: {
    fontSize: 13,
    color: colors.outline,
  },
  upcomingList: {
    gap: spacing.sm,
  },
  upcomingCard: {
    backgroundColor: 'rgba(255,255,255,0.60)',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    opacity: 0.85,
  },
  upcomingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outlineVariant,
    marginRight: spacing.md,
  },
  upcomingLeft: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurface,
  },
  upcomingCategory: {
    fontSize: 11,
    color: colors.outline,
    marginTop: 2,
  },
});

