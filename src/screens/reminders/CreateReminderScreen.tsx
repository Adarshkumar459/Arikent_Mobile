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
import { CalendarStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TextInput, DateInput, DropdownInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { ReminderType } from '../../services/api/reminderApi';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<CalendarStackParamList, 'AddReminder'>;

const TYPE_OPTIONS = [
  { label: 'General', value: 'general' },
  { label: 'Task', value: 'task' },
  { label: 'Goal', value: 'goal' },
  { label: 'Bill Payment', value: 'bill' },
  { label: 'Calendar Event', value: 'calendar' },
];

export const CreateReminderScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReminderType>('general');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState<string>('09:00 AM');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) {
      setErrorMsg('Reminder title is required');
      return;
    }
    if (!date.trim()) {
      setErrorMsg('Scheduled date is required');
      return;
    }

    const scheduledAt = `${date.trim()}T09:00:00.000Z`;

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await ReminderRepository.createReminder({
        title: title.trim(),
        type,
        scheduledAt,
      });
      setIsLoading(false);
      navigation.goBack();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to create reminder');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Add Reminder" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {errorMsg ? (
            <ErrorState title="Validation Error" message={errorMsg} onRetry={() => setErrorMsg(null)} retryLabel="Dismiss" />
          ) : null}

          <TextInput
            label="REMINDER TITLE"
            placeholder="e.g. Pay electricity bill"
            value={title}
            onChangeText={setTitle}
          />

          <DropdownInput
            label="CATEGORY / TYPE"
            options={TYPE_OPTIONS}
            value={type}
            onSelect={(val) => setType(val as ReminderType)}
          />

          <DateInput
            label="SCHEDULED DATE"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeDate={setDate}
          />

          <TextInput
            label="TIME"
            placeholder="e.g. 09:00 AM"
            value={time}
            onChangeText={setTime}
          />

          <View style={styles.actionWrapper}>
            <PrimaryButton
              title="Save Reminder"
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
