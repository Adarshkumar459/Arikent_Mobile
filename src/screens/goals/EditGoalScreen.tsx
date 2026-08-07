import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../navigation/types';
import { GoalRepository } from '../../repositories/GoalRepository';
import { GoalCategory, GoalStatus } from '../../services/api/goalApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'EditGoal'>;

const CATEGORIES: { label: string; value: GoalCategory }[] = [
  { label: 'Learning', value: 'learning' },
  { label: 'Money', value: 'money' },
  { label: 'Health', value: 'health' },
  { label: 'Career', value: 'career' },
  { label: 'Personal', value: 'personal' },
  { label: 'Other', value: 'other' },
];

const STATUSES: { label: string; value: GoalStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
];

export const EditGoalScreen: React.FC<Props> = ({ route, navigation }) => {
  const { goalId } = route.params;
  const insets = useSafeAreaInsets();

  const [isLoadingGoal, setIsLoadingGoal] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('learning');
  const [targetValueText, setTargetValueText] = useState('');
  const [unit, setUnit] = useState('');
  const [deadlineText, setDeadlineText] = useState('');
  const [status, setStatus] = useState<GoalStatus>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goal = await GoalRepository.getGoalById(goalId);
        setTitle(goal.title);
        setDescription(goal.description || '');
        setCategory(goal.category);
        setTargetValueText(goal.targetValue.toString());
        setUnit(goal.unit);
        setStatus(goal.status);
        if (goal.deadline) {
          setDeadlineText(goal.deadline.substring(0, 10));
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load goal details');
      } finally {
        setIsLoadingGoal(false);
      }
    };
    loadGoal();
  }, [goalId]);

  const handleUpdate = async () => {
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Goal title is required');
      return;
    }

    const targetVal = parseFloat(targetValueText.trim());
    if (isNaN(targetVal) || targetVal <= 0) {
      setErrorMsg('Target value must be a valid number greater than 0');
      return;
    }

    if (!unit.trim()) {
      setErrorMsg('Unit is required');
      return;
    }

    let parsedDeadline: string | null = null;
    if (deadlineText.trim()) {
      const dateObj = new Date(deadlineText.trim());
      if (isNaN(dateObj.getTime())) {
        setErrorMsg('Invalid deadline date format (Use YYYY-MM-DD)');
        return;
      }
      parsedDeadline = dateObj.toISOString();
    }

    setIsSubmitting(true);
    try {
      await GoalRepository.updateGoal(goalId, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        targetValue: targetVal,
        unit: unit.trim(),
        deadline: parsedDeadline,
        status,
      });

      navigation.goBack();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingGoal) {
    return <Loading message="Loading goal details..." />;
  }

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
        <Text style={styles.screenHeader}>Edit Goal</Text>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.chip, category === cat.value && styles.chipActive]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Target Value & Unit */}
        <View style={styles.rowGroup}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Target Value *</Text>
            <TextInput
              style={styles.textInput}
              value={targetValueText}
              onChangeText={setTargetValueText}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Unit *</Text>
            <TextInput
              style={styles.textInput}
              value={unit}
              onChangeText={setUnit}
            />
          </View>
        </View>

        {/* Deadline Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.textInput}
            value={deadlineText}
            onChangeText={setDeadlineText}
          />
        </View>

        {/* Status Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status *</Text>
          <View style={styles.chipRow}>
            {STATUSES.map((st) => (
              <TouchableOpacity
                key={st.value}
                style={[styles.chip, status === st.value && styles.chipActive]}
                onPress={() => setStatus(st.value)}
              >
                <Text style={[styles.chipText, status === st.value && styles.chipTextActive]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <Button
            variant="primary"
            label="Save Changes"
            isLoading={isSubmitting}
            onPress={handleUpdate}
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
  inputGroup: {
    marginBottom: spacing.lg,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: spacing.md,
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  buttonWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
