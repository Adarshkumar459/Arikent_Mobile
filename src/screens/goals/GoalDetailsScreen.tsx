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
import { GoalsStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { PrimaryButton, SecondaryButton, DangerButton } from '../../components/buttons';
import { StatusChip, CategoryChip } from '../../components/chips';
import { ProgressBar } from '../../components/progress/ProgressBar';
import { GoalRepository } from '../../repositories/GoalRepository';
import { GoalItem } from '../../services/api/goalApi';
import { GoalOptionsSheet } from '../../components/sheets/GoalOptionsSheet';

type Props = NativeStackScreenProps<GoalsStackParamList, 'GoalDetails'>;

export const GoalDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const goalId = route.params?.goalId;
  const [goal, setGoal] = useState<GoalItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const fetchGoal = async () => {
    if (!goalId) return;
    setIsLoading(true);
    try {
      const data = await GoalRepository.getGoalById(goalId);
      setGoal(data);
    } catch (err) {
      setGoal(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGoal();
    });
    return unsubscribe;
  }, [navigation, goalId]);

  const handleDelete = () => {
    if (!goal) return;
    Alert.alert('Delete Goal', 'Are you sure you want to delete this goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await GoalRepository.deleteGoal(goal.id);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete goal');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Goal Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Goal Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Goal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rawPercent = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
  const clampedPercent = Math.min(Math.max(Math.round(rawPercent), 0), 100);
  const remaining = Math.max(goal.targetValue - goal.currentValue, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Goal Details"
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
            <StatusChip status={goal.status as any} />
            <CategoryChip label={goal.category} selected />
          </View>

          <Text style={styles.title}>{goal.title}</Text>

          {goal.description ? (
            <Text style={styles.description}>{goal.description}</Text>
          ) : (
            <Text style={styles.noDesc}>No description provided.</Text>
          )}

          <View style={styles.progressBox}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>PROGRESS ({clampedPercent}%)</Text>
              <Text style={styles.progressValues}>
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </Text>
            </View>
            <ProgressBar progress={clampedPercent} />
            <Text style={styles.remainingText}>Remaining: {remaining} {goal.unit}</Text>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Deadline:</Text>
            <Text style={styles.metaValue}>
              {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'None'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created:</Text>
            <Text style={styles.metaValue}>{new Date(goal.createdAt).toLocaleDateString()}</Text>
          </View>

          {/* History Timeline */}
          {goal.history && goal.history.length > 0 ? (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>PROGRESS HISTORY</Text>
              {goal.history.slice(-3).map((h, idx) => (
                <View key={h.id || idx} style={styles.historyItem}>
                  <Text style={styles.historyValue}>
                    {h.value} {goal.unit} ({h.progress}%)
                  </Text>
                  {h.note ? <Text style={styles.historyNote}>{h.note}</Text> : null}
                  <Text style={styles.historyDate}>{new Date(h.recordedAt).toLocaleDateString()}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title="Update Progress"
            onPress={() => navigation.navigate('UpdateGoalProgress', { goalId: goal.id })}
          />
          <SecondaryButton
            title="Edit Goal"
            onPress={() => navigation.navigate('EditGoal', { goalId: goal.id })}
          />
          <DangerButton title="Delete Goal" onPress={handleDelete} />
        </View>
      </ScrollView>

      <GoalOptionsSheet
        visible={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        onEdit={() => navigation.navigate('EditGoal', { goalId: goal.id })}
        onUpdateProgress={() => navigation.navigate('UpdateGoalProgress', { goalId: goal.id })}
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
  progressBox: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  progressValues: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  remainingText: {
    ...typography.caption,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
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
  historySection: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  historyTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  historyItem: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radius.sm,
    gap: 2,
  },
  historyValue: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyNote: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyDate: {
    ...typography.caption,
    color: colors.textDisabled,
    fontSize: 10,
  },
  actions: {
    gap: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
});
