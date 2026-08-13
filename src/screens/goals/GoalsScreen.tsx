import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { GoalsStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { GoalRepository } from '../../repositories/GoalRepository';
import { GoalItem, GoalCategory, GoalStatus } from '../../services/api/goalApi';
import { useCustomAlert } from '../../components/alerts/CustomAlert';
import { GoalOptionsSheet } from '../../components/sheets/GoalOptionsSheet';
import { GoalLoadingScreen } from './GoalLoadingScreen';
import { GoalEmptyScreen } from './GoalEmptyScreen';
import { GoalErrorScreen } from './GoalErrorScreen';
import { useTabNav } from '../../context/TabContext';

type Props = NativeStackScreenProps<GoalsStackParamList, 'GoalList'>;

const FILTER_TABS: Array<{ label: string; value?: string }> = [
  { label: 'All' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Overdue', value: 'overdue' },
];

export const GoalsScreen: React.FC<Props> = ({ navigation }) => {
  const { switchTab } = useTabNav();
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected goal for options sheet
  const [activeGoal, setActiveGoal] = useState<GoalItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { showAlert, CustomAlertModal } = useCustomAlert();

  const fetchGoals = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await GoalRepository.getGoals();
      setGoals(res.items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch goals');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGoals(goals.length === 0);
    }, [fetchGoals])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchGoals(false);
  }, [fetchGoals]);

  const handleOpenSheet = (item: GoalItem) => {
    setActiveGoal(item);
    setIsSheetOpen(true);
  };

  const handleDeleteActiveGoal = async () => {
    if (!activeGoal) return;
    try {
      await GoalRepository.deleteGoal(activeGoal.id);
      setIsSheetOpen(false);
      fetchGoals(false);
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to delete goal', 'error');
    }
  };

  // Summary Metrics Computation
  const totalGoals = goals.length;
  const activeCount = goals.filter((g) => g.status === 'active').length;
  const completedCount = goals.filter((g) => g.status === 'completed').length;
  const overdueCount = goals.filter((g) => {
    if (!g.deadline || g.status === 'completed') return false;
    return new Date(g.deadline).getTime() < Date.now();
  }).length;

  const overallPercentage =
    totalGoals > 0
      ? Math.round(
          goals.reduce((acc, g) => {
            const pct = g.targetValue > 0 ? Math.min((g.currentValue / g.targetValue) * 100, 100) : 0;
            return acc + pct;
          }, 0) / totalGoals
        )
      : 0;

  // Filtered Goals
  const filteredGoals = goals.filter((g) => {
    if (activeFilter === 'Active') return g.status === 'active';
    if (activeFilter === 'Completed') return g.status === 'completed';
    if (activeFilter === 'Overdue') {
      if (!g.deadline || g.status === 'completed') return false;
      return new Date(g.deadline).getTime() < Date.now();
    }
    return true;
  });

  if (isLoading && !isRefreshing) {
    return <GoalLoadingScreen />;
  }

  if (errorMsg && goals.length === 0) {
    return <GoalErrorScreen errorMessage={errorMsg} onRetry={() => fetchGoals(true)} />;
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ScreenHeader matching Task, Expense & Calendar pages SAME TO SAME */}
      <ScreenHeader
        title="Goals"
        subtitle="Turn plans into progress."
        onBackPress={() => switchTab('Home')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Summary Card with Ring Progress & Counts */}
        <View style={styles.summaryCard}>
          <View style={styles.ringWrapper}>
            <View style={styles.ringCircle}>
              <Text style={styles.ringPercentText}>{overallPercentage}%</Text>
            </View>
          </View>

          <View style={styles.summaryStatsGrid}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>ACTIVE</Text>
              <Text style={[styles.statVal, { color: colors.primaryContainer }]}>{activeCount}</Text>
            </View>

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>COMPLETED</Text>
              <Text style={[styles.statVal, { color: '#007856' }]}>{completedCount}</Text>
            </View>

            <View style={[styles.statCol, { width: '100%', marginTop: spacing.xs }]}>
              <Text style={styles.statLabel}>OVERDUE</Text>
              <Text style={[styles.statVal, { color: colors.error, fontSize: 16 }]}>
                ⚠️ {overdueCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Primary CTA Add Goal */}
        <TouchableOpacity
          style={styles.addGoalBtn}
          onPress={() => navigation.navigate('AddGoal')}
          activeOpacity={0.85}
        >
          <Text style={styles.addGoalBtnIcon}>+</Text>
          <Text style={styles.addGoalBtnText}>Add Goal</Text>
        </TouchableOpacity>

        {/* Filter Pills Bar */}
        <View style={styles.filterBar}>
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.label;
            return (
              <TouchableOpacity
                key={tab.label}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(tab.label)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Goals List Cards */}
        {filteredGoals.length === 0 ? (
          <GoalEmptyScreen />
        ) : (
          <View style={styles.goalsList}>
            {filteredGoals.map((item) => {
              const progressPct =
                item.targetValue > 0
                  ? Math.min(Math.round((item.currentValue / item.targetValue) * 100), 100)
                  : 0;

              const isCompleted = item.status === 'completed';
              const accentColor =
                item.category === 'money'
                  ? '#007856'
                  : item.category === 'career'
                  ? colors.primary
                  : colors.primaryContainer;

              const formattedDeadline = item.deadline
                ? new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'No Deadline';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.goalCard, { borderLeftColor: accentColor }]}
                  onPress={() => navigation.navigate('GoalDetails', { goalId: item.id })}
                  onLongPress={() => handleOpenSheet(item)}
                  activeOpacity={0.88}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: accentColor + '1F' }]}>
                      <Text style={[styles.categoryBadgeText, { color: accentColor }]}>
                        {item.category ? item.category.toUpperCase() : 'GENERAL'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleOpenSheet(item)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.moreIcon}>•••</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.goalTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  {/* Progress Info & Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeaderRow}>
                      <Text style={styles.progressValueText}>
                        {item.currentValue} / {item.targetValue} {item.unit || ''}
                      </Text>
                      <Text style={[styles.progressPctText, { color: accentColor }]}>
                        {progressPct}%
                      </Text>
                    </View>

                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${progressPct}%`, backgroundColor: accentColor },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Footer Meta */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.deadlineText}>📅 Due {formattedDeadline}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Contextual Action Sheet */}
      <GoalOptionsSheet
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onEdit={() => {
          setIsSheetOpen(false);
          if (activeGoal) navigation.navigate('EditGoal', { goalId: activeGoal.id });
        }}
        onUpdateProgress={() => {
          setIsSheetOpen(false);
          if (activeGoal) navigation.navigate('UpdateGoalProgress', { goalId: activeGoal.id });
        }}
        onDelete={handleDeleteActiveGoal}
      />
      <CustomAlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 60,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...elevation.small,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 7,
    borderColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
  },
  ringPercentText: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: '700',
  },
  summaryStatsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: spacing.lg,
    gap: spacing.sm,
  },
  statCol: {
    width: '45%',
  },
  statLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.outline,
    letterSpacing: 0.5,
  },
  statVal: {
    ...typography.heading2,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  addGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    backgroundColor: colors.primaryContainer,
    borderRadius: 14,
    gap: spacing.xs,
    ...elevation.small,
  },
  addGoalBtnIcon: {
    color: colors.textLight,
    fontSize: 24,
    fontWeight: '400',
  },
  addGoalBtnText: {
    ...typography.heading4,
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '700',
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
  goalsList: {
    gap: spacing.md,
  },
  goalCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    gap: spacing.sm,
    ...elevation.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  moreIcon: {
    fontSize: 16,
    color: colors.outline,
    letterSpacing: -1,
  },
  goalTitle: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: '700',
  },
  progressSection: {
    gap: 4,
    marginTop: 4,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressValueText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  progressPctText: {
    ...typography.heading4,
    fontSize: 14,
    fontWeight: '700',
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardFooter: {
    marginTop: 4,
  },
  deadlineText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.outline,
  },
});
