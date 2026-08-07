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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskCategory, TaskPriority, TaskStatus, RecurrenceFrequency } from '../../services/api/taskApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'EditTask'>;

const CATEGORIES: { label: string; value: TaskCategory }[] = [
  { label: 'Personal', value: 'personal' },
  { label: 'Work', value: 'work' },
  { label: 'Home', value: 'home' },
  { label: 'Finance', value: 'finance' },
  { label: 'Health', value: 'health' },
  { label: 'Other', value: 'other' },
];

const PRIORITIES: { label: string; value: TaskPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const STATUSES: { label: string; value: TaskStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

const RECURRENCES: { label: string; value: RecurrenceFrequency | 'none' }[] = [
  { label: 'None', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export const EditTaskScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { taskId } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [dueDateText, setDueDateText] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency | 'none'>('none');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadTask = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const task = await TaskRepository.getTaskById(taskId);
        setTitle(task.title);
        setDescription(task.description || '');
        setCategory(task.category);
        setPriority(task.priority);
        setStatus(task.status);
        if (task.dueDate) {
          setDueDateText(task.dueDate.split('T')[0]);
        }
        if (task.recurrence) {
          setRecurrence(task.recurrence.frequency);
        } else {
          setRecurrence('none');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load task');
      } finally {
        setIsLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  const handleSave = async () => {
    setErrorMsg(null);
    if (!title.trim()) {
      setErrorMsg('Task title is required');
      return;
    }

    let parsedDueDate: string | null = null;
    if (dueDateText.trim()) {
      const dateObj = new Date(dueDateText.trim());
      if (isNaN(dateObj.getTime())) {
        setErrorMsg('Invalid due date format (Use YYYY-MM-DD)');
        return;
      }
      parsedDueDate = dateObj.toISOString();
    }

    setIsSaving(true);
    try {
      await TaskRepository.updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        status,
        dueDate: parsedDueDate,
        recurrence: recurrence !== 'none' ? { frequency: recurrence, interval: 1 } : null,
      });

      navigation.goBack();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading task details..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenHeader}>Edit Task</Text>

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
            numberOfLines={4}
          />
        </View>

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.chip,
                  category === cat.value && styles.chipActive,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === cat.value && styles.chipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map((prio) => (
              <TouchableOpacity
                key={prio.value}
                style={[
                  styles.chip,
                  priority === prio.value && styles.chipActivePriority,
                ]}
                onPress={() => setPriority(prio.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    priority === prio.value && styles.chipTextActive,
                  ]}
                >
                  {prio.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.chipRow}>
            {STATUSES.map((stat) => (
              <TouchableOpacity
                key={stat.value}
                style={[
                  styles.chip,
                  status === stat.value && styles.chipActiveStatus,
                ]}
                onPress={() => setStatus(stat.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    status === stat.value && styles.chipTextActive,
                  ]}
                >
                  {stat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.textInput}
            value={dueDateText}
            onChangeText={setDueDateText}
          />
        </View>

        {/* Recurrence Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recurrence</Text>
          <View style={styles.chipRow}>
            {RECURRENCES.map((rec) => (
              <TouchableOpacity
                key={rec.value}
                style={[
                  styles.chip,
                  recurrence === rec.value && styles.chipActive,
                ]}
                onPress={() => setRecurrence(rec.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    recurrence === rec.value && styles.chipTextActive,
                  ]}
                >
                  {rec.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Action */}
        <View style={styles.buttonWrapper}>
          <Button
            variant="primary"
            label="Save Changes"
            isLoading={isSaving}
            onPress={handleSave}
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
    height: 100,
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
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipActivePriority: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipActiveStatus: {
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
