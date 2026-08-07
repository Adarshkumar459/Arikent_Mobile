import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../navigation/types';
import { GoalRepository } from '../../repositories/GoalRepository';
import { GoalItem } from '../../services/api/goalApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'GoalDetails'>;

export const GoalDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { goalId } = route.params;
  const insets = useSafeAreaInsets();

  const [goal, setGoal] = useState<GoalItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [togglingMilestoneId, setTogglingMilestoneId] = useState<string | null>(null);

  const fetchGoalDetails = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await GoalRepository.getGoalById(goalId);
      setGoal(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load goal details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGoalDetails(goal === null);
    });
    return unsubscribe;
  }, [navigation, goalId]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchGoalDetails(false);
  }, [goalId]);

  const handleToggleMilestone = async (milestoneId: string, currentStatus: boolean) => {
    setTogglingMilestoneId(milestoneId);
    try {
      const updatedGoal = await GoalRepository.toggleMilestone(goalId, milestoneId, !currentStatus);
      setGoal(updatedGoal);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update milestone');
    } finally {
      setTogglingMilestoneId(null);
    }
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
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

  if (isLoading && !isRefreshing) {
    return <Loading message="Loading goal details..." />;
  }

  if (errorMsg || !goal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg || 'Goal not found'}</Text>
        <Button variant="secondary" label="Retry" onPress={() => fetchGoalDetails(true)} />
      </View>
    );
  }

  const progressPct = Math.min(
    100,
    Math.max(0, Math.round((goal.currentValue / goal.targetValue) * 100))
  );
  const isCompleted = goal.status === 'completed';
  const todayStr = new Date().toISOString().substring(0, 10);
  const isOverdue =
    goal.status === 'active' &&
    goal.deadline &&
    goal.deadline.substring(0, 10) < todayStr;

  // Reverse history so newest entries appear first
  const sortedHistory = [...(goal.history || [])].reverse();

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
        {/* Title & Metadata Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{goal.category.toUpperCase()}</Text>
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

          <Text style={styles.goalTitle}>{goal.title}</Text>
          {goal.description ? (
            <Text style={styles.goalDesc}>{goal.description}</Text>
          ) : null}

          {goal.deadline ? (
            <Text style={[styles.deadlineText, isOverdue && styles.deadlineTextOverdue]}>
              Deadline: {new Date(goal.deadline).toLocaleDateString()}
            </Text>
          ) : null}
        </View>

        {/* Progress Banner */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressCardTitle}>Overall Progress</Text>
            <Text style={styles.progressPctText}>{progressPct}%</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPct}%` },
                isCompleted && { backgroundColor: colors.success },
              ]}
            />
          </View>

          <View style={styles.progressStatRow}>
            <Text style={styles.progressStatText}>
              Current: <Text style={styles.statHighlight}>{goal.currentValue} {goal.unit}</Text>
            </Text>
            <Text style={styles.progressStatText}>
              Target: <Text style={styles.statHighlight}>{goal.targetValue} {goal.unit}</Text>
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button
            variant="primary"
            label="Log Progress"
            onPress={() => navigation.navigate('UpdateGoalProgress', { goalId: goal.id })}
            style={{ flex: 1 }}
          />
          <Button
            variant="secondary"
            label="Edit Goal"
            onPress={() => navigation.navigate('EditGoal', { goalId: goal.id })}
            style={{ flex: 1 }}
          />
        </View>

        {/* Milestones Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Milestones ({goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length})
          </Text>

          {goal.milestones.length === 0 ? (
            <Text style={styles.emptySectionText}>No milestones set for this goal.</Text>
          ) : (
            <View style={styles.milestoneList}>
              {goal.milestones.map((m) => {
                const isToggling = togglingMilestoneId === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.milestoneRow}
                    disabled={isToggling}
                    onPress={() => handleToggleMilestone(m.id, m.completed)}
                  >
                    <View style={[styles.checkbox, m.completed && styles.checkboxChecked]}>
                      {isToggling ? (
                        <ActivityIndicator size="small" color={m.completed ? '#FFF' : colors.primary} />
                      ) : m.completed ? (
                        <Text style={styles.checkmark}>✓</Text>
                      ) : null}
                    </View>
                    <View style={styles.milestoneInfo}>
                      <Text style={[styles.milestoneTitle, m.completed && styles.milestoneTitleDone]}>
                        {m.title}
                      </Text>
                      <Text style={styles.milestoneTarget}>Target: {m.targetValue} {goal.unit}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Progress History Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Progress History ({sortedHistory.length})</Text>

          {sortedHistory.length === 0 ? (
            <Text style={styles.emptySectionText}>No progress history logged yet.</Text>
          ) : (
            <View style={styles.historyList}>
              {sortedHistory.map((h, idx) => (
                <View key={h.id || idx} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyValue}>
                        {h.value} {goal.unit} ({h.progress}%)
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(h.recordedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {h.note ? <Text style={styles.historyNote}>{h.note}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Delete Goal Button */}
        <View style={styles.deleteWrapper}>
          <Button
            variant="danger"
            label="Delete Goal"
            isLoading={isDeleting}
            onPress={handleDeleteConfirm}
          />
        </View>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...elevation.small,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  goalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  goalDesc: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  deadlineText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  deadlineTextOverdue: {
    color: colors.error,
    fontWeight: '700',
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...elevation.small,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressCardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  progressPctText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  progressStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStatText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statHighlight: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...elevation.small,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptySectionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  milestoneList: {
    gap: spacing.sm,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  milestoneTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  milestoneTarget: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyList: {
    gap: spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  historyContent: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyValue: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
