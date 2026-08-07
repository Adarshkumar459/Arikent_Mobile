import React, { useState } from 'react';
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
import { GoalCategory } from '../../services/api/goalApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateGoal'>;

const CATEGORIES: { label: string; value: GoalCategory }[] = [
  { label: 'Learning', value: 'learning' },
  { label: 'Money', value: 'money' },
  { label: 'Health', value: 'health' },
  { label: 'Career', value: 'career' },
  { label: 'Personal', value: 'personal' },
  { label: 'Other', value: 'other' },
];

interface MilestoneDraft {
  title: string;
  targetValue: string;
}

export const CreateGoalScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('learning');
  const [targetValueText, setTargetValueText] = useState('');
  const [currentValueText, setCurrentValueText] = useState('');
  const [unit, setUnit] = useState('');
  const [deadlineText, setDeadlineText] = useState('');
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddMilestoneInput = () => {
    setMilestones([...milestones, { title: '', targetValue: '' }]);
  };

  const handleRemoveMilestoneInput = (index: number) => {
    setMilestones(milestones.filter((_, idx) => idx !== index));
  };

  const handleMilestoneChange = (index: number, field: 'title' | 'targetValue', val: string) => {
    const updated = [...milestones];
    updated[index][field] = val;
    setMilestones(updated);
  };

  const handleCreate = async () => {
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

    const currentVal = currentValueText.trim() ? parseFloat(currentValueText.trim()) : 0;
    if (isNaN(currentVal) || currentVal < 0) {
      setErrorMsg('Current value must be a valid non-negative number');
      return;
    }

    if (!unit.trim()) {
      setErrorMsg('Unit is required (e.g. hours, pages, rupees)');
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

    // Format milestones
    const formattedMilestones = [];
    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      if (m.title.trim()) {
        const mTarget = parseFloat(m.targetValue.trim());
        if (isNaN(mTarget) || mTarget <= 0) {
          setErrorMsg(`Milestone #${i + 1} target value must be a number greater than 0`);
          return;
        }
        formattedMilestones.push({
          title: m.title.trim(),
          targetValue: mTarget,
          order: i,
        });
      }
    }

    setIsSubmitting(true);
    try {
      await GoalRepository.createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        targetValue: targetVal,
        currentValue: currentVal,
        unit: unit.trim(),
        deadline: parsedDeadline,
        milestones: formattedMilestones,
      });

      navigation.goBack();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Text style={styles.screenHeader}>Create New Goal</Text>

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
            placeholder="e.g. Read 100 pages of React Native"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Add details about your goal..."
            placeholderTextColor={colors.textSecondary}
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
              placeholder="e.g. 100"
              placeholderTextColor={colors.textSecondary}
              value={targetValueText}
              onChangeText={setTargetValueText}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Unit *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. pages, hours"
              placeholderTextColor={colors.textSecondary}
              value={unit}
              onChangeText={setUnit}
            />
          </View>
        </View>

        {/* Initial Current Value */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Starting Value</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0 (Optional)"
            placeholderTextColor={colors.textSecondary}
            value={currentValueText}
            onChangeText={setCurrentValueText}
            keyboardType="numeric"
          />
        </View>

        {/* Deadline Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 2026-12-31"
            placeholderTextColor={colors.textSecondary}
            value={deadlineText}
            onChangeText={setDeadlineText}
          />
        </View>

        {/* Milestones Section */}
        <View style={styles.milestoneSectionHeader}>
          <Text style={styles.label}>Milestones (Optional)</Text>
          <TouchableOpacity style={styles.addMilestoneBtn} onPress={handleAddMilestoneInput}>
            <Text style={styles.addMilestoneText}>+ Add Milestone</Text>
          </TouchableOpacity>
        </View>

        {milestones.map((m, idx) => (
          <View key={idx} style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneNumber}>Milestone #{idx + 1}</Text>
              <TouchableOpacity onPress={() => handleRemoveMilestoneInput(idx)}>
                <Text style={styles.removeMilestoneText}>Remove</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.textInput, { marginBottom: spacing.xs }]}
              placeholder="Milestone title (e.g. Read 50 pages)"
              placeholderTextColor={colors.textSecondary}
              value={m.title}
              onChangeText={(val) => handleMilestoneChange(idx, 'title', val)}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Target value (e.g. 50)"
              placeholderTextColor={colors.textSecondary}
              value={m.targetValue}
              onChangeText={(val) => handleMilestoneChange(idx, 'targetValue', val)}
              keyboardType="numeric"
            />
          </View>
        ))}

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <Button
            variant="primary"
            label="Create Goal"
            isLoading={isSubmitting}
            onPress={handleCreate}
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
  milestoneSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  addMilestoneBtn: {
    paddingVertical: 2,
  },
  addMilestoneText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  milestoneCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  milestoneNumber: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  removeMilestoneText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  buttonWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
