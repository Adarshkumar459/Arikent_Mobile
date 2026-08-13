import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TasksStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskItem, TaskCategory, TaskPriority, TaskRecurrence } from '../../services/api/taskApi';
import { DatePickerModal } from '../../components/modals/DatePickerModal';

type Props = NativeStackScreenProps<TasksStackParamList, 'EditTask'>;

const CATEGORIES: Array<{ label: string; value: TaskCategory }> = [
  { label: 'Personal', value: 'personal' },
  { label: 'Work', value: 'work' },
  { label: 'Home', value: 'home' },
  { label: 'Finance', value: 'finance' },
  { label: 'Health', value: 'health' },
  { label: 'Other', value: 'other' },
];

const PRIORITIES: Array<{ label: string; value: TaskPriority }> = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export const EditTaskScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params || {};
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [recurrence, setRecurrence] = useState<TaskRecurrence | null>(null);

  const [dateISO, setDateISO] = useState<string>('');
  const [dateFormatted, setDateFormatted] = useState<string>('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [notifyMe, setNotifyMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const data = await TaskRepository.getTaskById(taskId);
      setTitle(data.title);
      setDescription(data.description || '');
      setCategory(data.category || 'personal');
      setPriority(data.priority || 'medium');
      setRecurrence(data.recurrence || null);
      if (data.dueDate) {
        setDateISO(data.dueDate);
        setDateFormatted(
          new Date(data.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch task');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const handleUpdateTask = async () => {
    if (!title.trim() || !taskId) {
      Alert.alert('Required Field', 'Please enter a task title');
      return;
    }

    setIsSubmitting(true);
    try {
      await TaskRepository.updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        dueDate: dateISO || null,
        recurrence: recurrence || null,
      });

      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.safeArea}>
        <ScreenHeader title="Edit Task" />
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScreenHeader title="Edit Task" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Basic Info */}
        <View style={styles.sectionContainer}>
          <Text style={styles.fieldLabel}>Task Title *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Doctor appointment"
              placeholderTextColor={colors.outline}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <Text style={styles.fieldLabel}>Description / Note</Text>
          <View style={[styles.inputWrapper, { height: 90, paddingTop: 10 }]}>
            <TextInput
              style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]}
              placeholder="Add details..."
              placeholderTextColor={colors.outline}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Category Chips */}
        <View style={styles.sectionContainer}>
          <Text style={styles.fieldLabel}>Category</Text>
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
                  <Text style={[styles.catChipText, active && styles.catChipTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Priority Segmented Control */}
        <View style={styles.sectionContainer}>
          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={styles.priorityBar}>
            {PRIORITIES.map((p) => {
              const active = priority === p.value;
              return (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.prioritySegment, active && styles.prioritySegmentActive]}
                  onPress={() => setPriority(p.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.priorityText, active && styles.priorityTextActive]}>{p.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Timing Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.fieldLabel}>Date & Time</Text>
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setIsDatePickerOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.datePickerText}>{dateFormatted || 'Select Date & Time'}</Text>
            <Text style={{ fontSize: 16 }}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Setting Card */}
        <View style={styles.notifyCard}>
          <View style={styles.notifyRow}>
            <View style={styles.notifyLeft}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
              <Text style={styles.notifyTitle}>Notify me</Text>
            </View>
            <Switch
              value={notifyMe}
              onValueChange={setNotifyMe}
              trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryContainer }}
              thumbColor={colors.surfaceContainerLowest}
            />
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleUpdateTask}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.submitBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={isDatePickerOpen}
        initialDate={dateISO}
        onConfirm={(iso, formatted) => {
          setDateISO(iso);
          setDateFormatted(formatted);
          setIsDatePickerOpen(false);
        }}
        onCancel={() => setIsDatePickerOpen(false)}
      />
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
    gap: spacing.xl,
    paddingBottom: 90,
  },
  sectionContainer: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    ...elevation.small,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
  },
  datePickerText: {
    ...typography.body,
    fontSize: 15,
    color: colors.onSurface,
  },
  chipRow: {
    gap: spacing.xs,
  },
  catChip: {
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
  catChipText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  catChipTextActive: {
    color: colors.textLight,
    fontWeight: '700',
  },
  priorityBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: 4,
  },
  prioritySegment: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prioritySegmentActive: {
    backgroundColor: colors.surfaceContainerLowest,
    ...elevation.small,
  },
  priorityText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  priorityTextActive: {
    color: colors.primaryContainer,
    fontWeight: '700',
  },
  notifyCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...elevation.small,
  },
  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  notifyTitle: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.onSurface,
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
