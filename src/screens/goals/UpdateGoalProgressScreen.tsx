import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../navigation/types';
import { GoalRepository } from '../../repositories/GoalRepository';
import { GoalItem } from '../../services/api/goalApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'UpdateGoalProgress'>;

export const UpdateGoalProgressScreen: React.FC<Props> = ({ route, navigation }) => {
  const { goalId } = route.params;
  const insets = useSafeAreaInsets();

  const [goal, setGoal] = useState<GoalItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentValueText, setCurrentValueText] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const data = await GoalRepository.getGoalById(goalId);
        setGoal(data);
        setCurrentValueText(data.currentValue.toString());
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load goal details');
      } finally {
        setIsLoading(false);
      }
    };
    loadGoal();
  }, [goalId]);

  const handleSaveProgress = async () => {
    setErrorMsg(null);
    if (!goal) return;

    const parsedVal = parseFloat(currentValueText.trim());
    if (isNaN(parsedVal) || parsedVal < 0) {
      setErrorMsg('Please enter a valid non-negative number for current progress');
      return;
    }

    setIsSubmitting(true);
    try {
      await GoalRepository.updateGoalProgress(goalId, {
        currentValue: parsedVal,
        note: note.trim() || undefined,
      });

      navigation.goBack();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading goal details..." />;
  }

  if (errorMsg && !goal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Button variant="secondary" label="Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const parsedInput = parseFloat(currentValueText.trim());
  const validValue = isNaN(parsedInput) || parsedInput < 0 ? 0 : parsedInput;
  const targetVal = goal ? goal.targetValue : 1;
  const livePct = Math.min(100, Math.max(0, Math.round((validValue / targetVal) * 100)));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenHeader}>Log Goal Progress</Text>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {goal ? (
          <View style={styles.infoCard}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalTargetText}>
              Target: <Text style={styles.highlight}>{goal.targetValue} {goal.unit}</Text>
            </Text>

            {/* Live Progress Preview */}
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewLabel}>New Progress Preview</Text>
                <Text style={styles.previewPct}>{livePct}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${livePct}%` }]} />
              </View>
            </View>
          </View>
        ) : null}

        {/* Current Value Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Current Value ({goal?.unit}) *</Text>
          <TextInput
            style={styles.textInput}
            placeholder={`e.g. ${goal?.currentValue || 0}`}
            placeholderTextColor={colors.textSecondary}
            value={currentValueText}
            onChangeText={setCurrentValueText}
            keyboardType="numeric"
          />
        </View>

        {/* Optional Progress Note */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Progress Note (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Add notes (e.g. Finished chapter 5, ran 5km today)"
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <Button
            variant="primary"
            label="Save Progress"
            isLoading={isSubmitting}
            onPress={handleSaveProgress}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  screenHeader: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...elevation.small,
  },
  goalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  goalTargetText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  highlight: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  previewBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  previewLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  previewPct: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
