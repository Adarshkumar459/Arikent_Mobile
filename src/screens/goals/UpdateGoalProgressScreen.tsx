import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoalsStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TextInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { ProgressBar } from '../../components/progress/ProgressBar';
import { GoalRepository } from '../../repositories/GoalRepository';
import { GoalItem } from '../../services/api/goalApi';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<GoalsStackParamList, 'UpdateGoalProgress'>;

export const UpdateGoalProgressScreen: React.FC<Props> = ({ route, navigation }) => {
  const goalId = route.params?.goalId;
  const [goal, setGoal] = useState<GoalItem | null>(null);
  const [currentValueInput, setCurrentValueInput] = useState('');
  const [note, setNote] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!goalId) return;
    GoalRepository.getGoalById(goalId)
      .then((data) => {
        setGoal(data);
        setCurrentValueInput(String(data.currentValue));
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Goal not found');
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [goalId]);

  const handleSaveProgress = async () => {
    if (!goal) return;
    const newNum = parseFloat(currentValueInput);
    if (isNaN(newNum) || newNum < 0) {
      setErrorMsg('Please enter a valid non-negative progress value');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      const updated = await GoalRepository.updateGoalProgress(goal.id, {
        currentValue: newNum,
        note: note.trim() || undefined,
      });
      setIsLoading(false);
      if (updated.currentValue >= updated.targetValue || updated.status === 'completed') {
        navigation.replace('GoalCompleted', { goalId: updated.id });
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to update progress');
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Update Progress" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Update Progress" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Goal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rawPercent = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
  const clampedPercent = Math.min(Math.max(Math.round(rawPercent), 0), 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Update Progress" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {errorMsg ? (
            <ErrorState title="Error" message={errorMsg} onRetry={() => setErrorMsg(null)} retryLabel="Dismiss" />
          ) : null}

          <View style={styles.summaryBox}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </Text>
              <Text style={styles.percentText}>{clampedPercent}%</Text>
            </View>
            <ProgressBar progress={clampedPercent} />
          </View>

          <TextInput
            label={`NEW CURRENT VALUE (${goal.unit})`}
            placeholder={`Target: ${goal.targetValue}`}
            value={currentValueInput}
            onChangeText={setCurrentValueInput}
            keyboardType="decimal-pad"
          />

          <TextInput
            label="PROGRESS NOTE"
            placeholder="e.g. Added monthly savings"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />

          <View style={styles.actionWrapper}>
            <PrimaryButton
              title="Save Progress"
              onPress={handleSaveProgress}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  summaryBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  goalTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  percentText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  actionWrapper: {
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
});
