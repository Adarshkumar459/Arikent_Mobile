import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TasksStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TextInput, DateInput, DropdownInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskCategory, TaskPriority } from '../../services/api/taskApi';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<TasksStackParamList, 'AddTask'>;

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

export const AddTaskScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) {
      setErrorMsg('Task title is required');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await TaskRepository.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        dueDate: dueDate.trim() || null,
      });
      setIsLoading(false);
      navigation.goBack();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to create task');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Add New Task" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {errorMsg ? (
            <ErrorState title="Validation Error" message={errorMsg} onRetry={() => setErrorMsg(null)} retryLabel="Dismiss" />
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
              title="Create Task"
              onPress={handleCreate}
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
