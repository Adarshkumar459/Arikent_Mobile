import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoalsStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { GoalRepository } from '../../repositories/GoalRepository';
import { GoalCategory } from '../../services/api/goalApi';
import { useCustomAlert } from '../../components/alerts/CustomAlert';
import { DatePickerModal } from '../../components/modals/DatePickerModal';

type Props = NativeStackScreenProps<GoalsStackParamList, 'AddGoal'>;

const CATEGORIES: Array<{ label: string; value: GoalCategory; icon: string }> = [
  { label: 'Learning', value: 'learning', icon: '📚' },
  { label: 'Money', value: 'money', icon: '💳' },
  { label: 'Health', value: 'health', icon: '💊' },
  { label: 'Career', value: 'career', icon: '💼' },
  { label: 'Personal', value: 'personal', icon: '👤' },
  { label: 'Other', value: 'other', icon: '🚩' },
];

export const CreateGoalScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('learning');
  const [startValue, setStartValue] = useState('0');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('books');
  const [deadlineISO, setDeadlineISO] = useState<string>('');
  const [deadlineFormatted, setDeadlineFormatted] = useState<string>('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [milestones, setMilestones] = useState<Array<{ title: string; targetValue: string }>>([
    { title: '', targetValue: '' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert, CustomAlertModal } = useCustomAlert();

  const handleAddMilestoneField = () => {
    setMilestones((prev) => [...prev, { title: '', targetValue: '' }]);
  };

  const handleUpdateMilestone = (index: number, field: 'title' | 'targetValue', val: string) => {
    setMilestones((prev) => {
      const copy = [...prev];
      copy[index][field] = val;
      return copy;
    });
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      showAlert('Required Field', 'Please enter a goal title', 'warning');
      return;
    }

    const numTarget = parseFloat(targetValue);
    if (isNaN(numTarget) || numTarget <= 0) {
      showAlert('Required Field', 'Please enter a valid target value greater than 0', 'warning');
      return;
    }

    const numStart = parseFloat(startValue) || 0;

    setIsSubmitting(true);
    try {
      const validMilestones = milestones
        .filter((m) => m.title.trim() !== '')
        .map((m, idx) => ({
          title: m.title.trim(),
          targetValue: parseFloat(m.targetValue) || numTarget,
          completed: false,
          order: idx + 1,
        }));

      await GoalRepository.createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        currentValue: numStart,
        targetValue: numTarget,
        unit: unit.trim() || 'units',
        deadline: deadlineISO || undefined,
        milestones: validMilestones.length > 0 ? validMilestones : undefined,
      });

      navigation.goBack();
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to create goal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScreenHeader title="Create Goal" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Goal Basics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.fieldLabel}>Goal Title *</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🚩</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What do you want to achieve?"
              placeholderTextColor={colors.outline}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <Text style={styles.fieldLabel}>Description (Optional)</Text>
          <View style={[styles.inputWrapper, { height: 90, alignItems: 'flex-start', paddingTop: 10 }]}>
            <TextInput
              style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]}
              placeholder="Add details to keep you motivated..."
              placeholderTextColor={colors.outline}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.catChip, active && styles.catChipActive]}
                  onPress={() => setCategory(cat.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.catChipIcon}>{cat.icon}</Text>
                  <Text style={[styles.catChipText, active && styles.catChipTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Targets & Metrics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Targets & Metrics</Text>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Starting Value</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.textInput, { textAlign: 'center' }]}
                  keyboardType="numeric"
                  value={startValue}
                  onChangeText={setStartValue}
                />
              </View>
            </View>

            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Target Value *</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.primaryContainer }]}>
                <TextInput
                  style={[styles.textInput, { textAlign: 'center', fontWeight: '700' }]}
                  placeholder="e.g. 100"
                  placeholderTextColor={colors.outline}
                  keyboardType="numeric"
                  value={targetValue}
                  onChangeText={setTargetValue}
                />
              </View>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Unit</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. books, ₹"
                  placeholderTextColor={colors.outline}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Deadline</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setIsDatePickerOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.textInput}>{deadlineFormatted || 'Select Date'}</Text>
                <Text style={{ fontSize: 14 }}>📅</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Milestones Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Milestones (Optional)</Text>
          {milestones.map((m, idx) => (
            <View key={idx} style={styles.milestoneRow}>
              <View style={styles.milestoneNumBadge}>
                <Text style={styles.milestoneNumText}>{idx + 1}</Text>
              </View>
              <TextInput
                style={[styles.textInput, { flex: 1, borderBottomWidth: 1, borderBottomColor: colors.border }]}
                placeholder="Milestone Title"
                placeholderTextColor={colors.outline}
                value={m.title}
                onChangeText={(v) => handleUpdateMilestone(idx, 'title', v)}
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.addMilestoneBtn}
            onPress={handleAddMilestoneField}
            activeOpacity={0.8}
          >
            <Text style={styles.addMilestoneText}>+ Add Milestone</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleCreate}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.submitBtnText}>Create Goal  ✓</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={isDatePickerOpen}
        initialDate={deadlineISO}
        onConfirm={(iso, formatted) => {
          setDeadlineISO(iso);
          setDeadlineFormatted(formatted);
          setIsDatePickerOpen(false);
        }}
        onCancel={() => setIsDatePickerOpen(false)}
      />
      <CustomAlertModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: 90,
  },
  sectionContainer: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: '700',
  },
  fieldLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    ...elevation.small,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
  },
  chipRow: {
    gap: spacing.xs,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  catChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  catChipIcon: {
    fontSize: 14,
  },
  catChipText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  catChipTextActive: {
    color: colors.textLight,
    fontWeight: '700',
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gridCol: {
    flex: 1,
    gap: 4,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  milestoneNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneNumText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  addMilestoneBtn: {
    height: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  addMilestoneText: {
    ...typography.caption,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.small,
  },
  submitBtnText: {
    ...typography.heading4,
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '700',
  },
});
