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
import { HabitRepository } from '../../repositories/HabitRepository';
import { HabitFrequency } from '../../services/api/habitApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';

type Props = NativeStackScreenProps<any, 'CreateHabit'>;

export const CreateHabitScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('health');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async () => {
    setErrorMsg(null);
    if (!title.trim()) {
      setErrorMsg('Habit title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await HabitRepository.createHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        frequency,
        reminder: reminderEnabled ? { enabled: true, time: reminderTime } : undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Create Habit" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}>
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        <TextInput style={styles.input} placeholder="Title *" value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />

        <Button variant="primary" label="Create Habit" isLoading={isSubmitting} onPress={handleCreate} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
  error: { ...typography.caption, color: colors.error },
});
