import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TasksStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TextInput, DateInput, DropdownInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskCategory, TaskPriority, TaskStatus } from '../../services/api/taskApi';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<TasksStackParamList, 'EditTask'>;

const CATEGORY_OPTIONS = [
  { label: 'Personal', value: 'personal' },
  { label: 'Work', value: 'work' },
  { label: 'Home', value: 'home' },
  { label: 'Finance', value: 'finance' },
  { label: 'Health', value: 'health' },
  { label: 'Other', value: 'other' },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export const EditTaskScreen: React.FC<Props> = ({ route, navigation }) => {
  const taskId = route.params?.taskId;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [dueDate, setDueDate] = useState<string>('');
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;
    TaskRepository.getTaskById(taskId)
      .then((task) => {
        setTitle(task.title);
        setDescription(task.description || '');
        setCategory(task.category);
        setPriority(task.priority);
        setStatus(task.status);
        setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Task not found');
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [taskId]);

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg('Task title is required');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await TaskRepository.updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        status,
        dueDate: dueDate.trim() || null,
      });
      setIsLoading(false);
      navigation.goBack();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to update task');
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Edit Task" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Edit Task" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {errorMsg ? (
            <ErrorState title="Error" message={errorMsg} onRetry={() => setErrorMsg(null)} retryLabel="Dismiss" />
          ) : null}

          <TextInput
            label="TASK TITLE"
            placeholder="e.g. Complete quarterly report"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            label="DESCRIPTION"
            placeholder="Add details or notes..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <DropdownInput
            label="STATUS"
            options={STATUS_OPTIONS}
            value={status}
            onSelect={(val) => setStatus(val as TaskStatus)}
          />

          <DropdownInput
            label="CATEGORY"
            options={CATEGORY_OPTIONS}
            value={category}
            onSelect={(val) => setCategory(val as TaskCategory)}
          />

          <DropdownInput
            label="PRIORITY"
            options={PRIORITY_OPTIONS}
            value={priority}
            onSelect={(val) => setPriority(val as TaskPriority)}
          />

          <DateInput
            label="DUE DATE"
            placeholder="YYYY-MM-DD"
            value={dueDate}
            onChangeDate={setDueDate}
          />

          <View style={styles.actionWrapper}>
            <PrimaryButton
              title="Save Changes"
              onPress={handleSave}
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
    gap: spacing.md,
  },
  actionWrapper: {
    marginTop: spacing.md,
  },
});
