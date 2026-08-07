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
import { MainStackParamList } from '../../navigation/types';
import { GoalRepository } from '../../repositories/GoalRepository';
import { GoalItem, GoalStatus, GoalCategory } from '../../services/api/goalApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/feedback/EmptyState';

type Props = NativeStackScreenProps<MainStackParamList, 'Goals'>;

type FilterTab = 'all' | 'active' | 'completed' | 'overdue';

export const GoalsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchGoals = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await GoalRepository.getGoals();
      setGoals(res.items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load goals');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGoals(goals.length === 0);
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchGoals(false);
  }, []);

  // Filter goals
  const todayStr = new Date().toISOString().substring(0, 10);
  const filteredGoals = goals.filter((g) => {
    if (activeFilter === 'active') return g.status === 'active';
    if (activeFilter === 'completed') return g.status === 'completed';
    if (activeFilter === 'overdue') {
      if (g.status !== 'active' || !g.deadline) return false;
      return g.deadline.substring(0, 10) < todayStr;
    }
    return true;
  });

  const totalCount = goals.length;
  const activeCount = goals.filter((g) => g.status === 'active').length;
  const completedCount = goals.filter((g) => g.status === 'completed').length;
  const overdueCount = goals.filter((g) => {
    if (g.status !== 'active' || !g.deadline) return false;
    return g.deadline.substring(0, 10) < todayStr;
  }).length;

  const overallProgress =
    totalCount === 0
      ? 0
      : Math.round(
          (goals.reduce(
            (acc, g) =>
              acc + Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)),
            0
          ) /
            totalCount)
        );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header Action */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenTitle}>My Goals</Text>
            <Text style={styles.screenSubtitle}>Track progress & hit your milestones</Text>
          </View>
          <Button
            variant="primary"
            label="+ Add Goal"
            onPress={() => navigation.navigate('CreateGoal')}
            style={styles.addBtn}
          />
        </View>

        {/* Error State */}
        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Button variant="secondary" label="Retry" onPress={() => fetchGoals(true)} style={styles.retryBtn} />
          </View>
        ) : null}

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Goals Overview</Text>
            <View style={styles.rateBadge}>
              <Text style={styles.rateBadgeText}>{overallProgress}% Progress</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${Math.min(overallProgress, 100)}%` }]} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalCount}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{activeCount}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.error }]}>{overdueCount}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
          </View>
        </View>

        {/* Filter Segmented Tabs */}
        <View style={styles.filterBar}>
          {(['all', 'active', 'completed', 'overdue'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading State */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching your goals...</Text>
          </View>
        ) : filteredGoals.length === 0 ? (
          <EmptyState
            title={
              goals.length === 0
                ? 'No goals yet'
                : `No ${activeFilter} goals`
            }
            description={
              goals.length === 0
                ? 'Create your first goal and start tracking your progress.'
                : 'Try changing your filter options or add a new goal.'
            }
            actionLabel="+ Add Goal"
            onAction={() => navigation.navigate('CreateGoal')}
          />
        ) : (
          /* Goal List */
          <View style={styles.goalList}>
            {filteredGoals.map((item) => {
              const progressPct = Math.min(
                100,
                Math.max(0, Math.round((item.currentValue / item.targetValue) * 100))
              );
              const isCompleted = item.status === 'completed';
              const isOverdue =
                item.status === 'active' &&
                item.deadline &&
                item.deadline.substring(0, 10) < todayStr;

              const completedMilestones = item.milestones.filter((m) => m.completed).length;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.goalCard}
                  onPress={() => navigation.navigate('GoalDetails', { goalId: item.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.titleWrapper}>
                      <Text style={styles.goalTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.description ? (
                        <Text style={styles.goalDesc} numberOfLines={1}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        isCompleted
                          ? styles.statusCompleted
                          : isOverdue
                          ? styles.statusOverdue
                          : styles.statusActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isCompleted
                            ? styles.statusTextCompleted
                            : isOverdue
                            ? styles.statusTextOverdue
                            : styles.statusTextActive,
                        ]}
                      >
                        {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar & Numeric Indicator */}
                  <View style={styles.cardProgressSection}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.progressValueText}>
                        {item.currentValue} / {item.targetValue} {item.unit}
                      </Text>
                      <Text style={styles.progressPctText}>{progressPct}%</Text>
                    </View>
                    <View style={styles.cardProgressTrack}>
                      <View
                        style={[
                          styles.cardProgressBar,
                          { width: `${progressPct}%` },
                          isCompleted && { backgroundColor: colors.success },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Card Footer */}
                  <View style={styles.cardFooter}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
                    </View>

                    {item.milestones.length > 0 ? (
                      <Text style={styles.milestoneText}>
                        {completedMilestones}/{item.milestones.length} milestones
                      </Text>
                    ) : null}

                    {item.deadline ? (
                      <Text style={[styles.deadlineText, isOverdue && styles.deadlineTextOverdue]}>
                        Due: {new Date(item.deadline).toLocaleDateString()}
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
  scrollContent: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  screenTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  screenSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    paddingHorizontal: spacing.md,
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
  summaryTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
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
  loadingBox: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  goalList: {
    gap: spacing.md,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...elevation.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleWrapper: {
    flex: 1,
    marginRight: spacing.md,
  },
  goalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  goalDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusActive: {
    backgroundColor: colors.primaryLight,
  },
  statusCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusOverdue: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextActive: {
    color: colors.primary,
  },
  statusTextCompleted: {
    color: colors.success,
  },
  statusTextOverdue: {
    color: colors.error,
  },
  cardProgressSection: {
    marginVertical: spacing.sm,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressValueText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressPctText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  cardProgressTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  cardProgressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
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
  milestoneText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  deadlineText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  deadlineTextOverdue: {
    color: colors.error,
    fontWeight: '700',
  },
});
