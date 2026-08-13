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
import { GoalsStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { GoalRepository } from '../../repositories/GoalRepository';
import { GoalItem } from '../../services/api/goalApi';

type Props = NativeStackScreenProps<GoalsStackParamList, 'GoalDetails'>;

export const GoalDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { goalId } = route.params || {};
  const [goal, setGoal] = useState<GoalItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchGoalDetails = async () => {
    if (!goalId) return;
    setIsLoading(true);
    try {
      const data = await GoalRepository.getGoalById(goalId);
      setGoal(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch goal details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGoalDetails();
    });
    return unsubscribe;
  }, [navigation, goalId]);

  const handleToggleMilestone = async (milestoneId: string, currentCompleted: boolean) => {
    if (!goalId || !goal) return;
    try {
      const updated = await GoalRepository.toggleMilestone(goalId, milestoneId, !currentCompleted);
      setGoal(updated);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update milestone');
    }
  };

  const handleDeleteGoal = async () => {
    if (!goalId) return;
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await GoalRepository.deleteGoal(goalId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete goal');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading || !goal) {
    return (
      <View style={styles.safeArea}>
        <ScreenHeader title="Goal Details" />
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const progressPct =
    goal.targetValue > 0 ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100) : 0;

  const formattedDeadline = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No Deadline';

  const completedMilestones = (goal.milestones || []).filter((m) => m.completed).length;
  const totalMilestones = (goal.milestones || []).length;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScreenHeader
        title="Goal Details"
        rightAction={
          <TouchableOpacity onPress={handleDeleteGoal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Card with Progress Ring */}
        <View style={styles.heroCard}>
          <View style={styles.heroAccentLine} />
          <Text style={styles.goalTitle}>{goal.title}</Text>
          {goal.description ? <Text style={styles.goalDescription}>{goal.description}</Text> : null}

          {/* Large Ring Chart */}
          <View style={styles.chartWrapper}>
            <View style={styles.chartRing}>
              <Text style={styles.chartPctText}>{progressPct}%</Text>
              <Text style={styles.chartValueText}>
                {goal.currentValue} / {goal.targetValue} {goal.unit || ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Chips Section */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>📚 {goal.category ? goal.category.toUpperCase() : 'GENERAL'}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.chipText, { color: colors.primary }]}>⚡ {goal.status.toUpperCase()}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>📅 Due {formattedDeadline}</Text>
          </View>
        </View>

        {/* Milestones Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            {totalMilestones > 0 ? (
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>
                  {completedMilestones}/{totalMilestones} Completed
                </Text>
              </View>
            ) : null}
          </View>

          {totalMilestones === 0 ? (
            <Text style={styles.emptyText}>No milestones set for this goal.</Text>
          ) : (
            <View style={styles.milestoneList}>
              {(goal.milestones || []).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.milestoneItem}
                  onPress={() => handleToggleMilestone(item.id, item.completed)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.checkSymbol, item.completed && styles.checkSymbolDone]}>
                    {item.completed ? '✓' : '○'}
                  </Text>
                  <Text style={[styles.milestoneTitle, item.completed && styles.milestoneTitleDone]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Progress History Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Progress History</Text>
          {(goal.history || []).length === 0 ? (
            <Text style={styles.emptyText}>No progress recorded yet.</Text>
          ) : (
            <View style={styles.historyTimeline}>
              {(goal.history || []).map((h, i) => (
                <View key={h.id || i} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyValue}>
                        {h.value} {goal.unit || ''}
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(h.recordedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    {h.note ? <Text style={styles.historyNote}>{h.note}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.updateProgressBtn}
          onPress={() => navigation.navigate('UpdateGoalProgress', { goalId: goal.id })}
          activeOpacity={0.85}
        >
          <Text style={styles.btnTextLight}>+ Update Progress</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditGoal', { goalId: goal.id })}
            activeOpacity={0.8}
          >
            <Text style={styles.btnTextPrimary}>✏️ Edit Goal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteGoal} activeOpacity={0.8}>
            <Text style={styles.btnTextDanger}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 110,
  },
  heroCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...elevation.small,
  },
  heroAccentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primaryContainer,
  },
  goalTitle: {
    ...typography.heading2,
    fontSize: 20,
    color: colors.onSurface,
    fontWeight: '800',
    marginBottom: 4,
  },
  goalDescription: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  chartRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 9,
    borderColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
  },
  chartPctText: {
    ...typography.display,
    fontSize: 28,
    color: colors.primaryContainer,
    fontWeight: '800',
  },
  chartValueText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.outline,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  chipText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface,
  },
  sectionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    gap: spacing.md,
    ...elevation.small,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 17,
    color: colors.onSurface,
    fontWeight: '700',
  },
  badgePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgePillText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  milestoneList: {
    gap: spacing.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  checkSymbol: {
    fontSize: 18,
    color: colors.outline,
  },
  checkSymbolDone: {
    color: colors.primaryContainer,
    fontWeight: '800',
  },
  milestoneTitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurface,
  },
  milestoneTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.outline,
  },
  historyTimeline: {
    gap: spacing.md,
    marginTop: 4,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryContainer,
    marginTop: 4,
  },
  historyContent: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 10,
    padding: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyValue: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: '700',
  },
  historyDate: {
    ...typography.caption,
    fontSize: 12,
    color: colors.outline,
  },
  historyNote: {
    ...typography.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.outline,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    gap: spacing.sm,
  },
  updateProgressBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.small,
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFDAD6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTextLight: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.textLight,
    fontWeight: '700',
  },
  btnTextPrimary: {
    ...typography.heading4,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  btnTextDanger: {
    ...typography.heading4,
    fontSize: 14,
    color: colors.error,
    fontWeight: '700',
  },
});
