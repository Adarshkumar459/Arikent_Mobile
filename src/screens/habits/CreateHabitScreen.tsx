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
import { HabitRepository } from '../../repositories/HabitRepository';
import { HabitFrequency } from '../../services/api/habitApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateHabit'>;

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
      setErrorMsg('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await HabitRepository.createHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        frequency,
        reminder: reminderEnabled ? { enabled: true, time: reminderTime } : { enabled: false },
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
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.screenHeader}>Create Habit</Text>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Habit Title *</Text>
          <TextInput style={styles.textInput} placeholder="e.g. Drink 2L water" placeholderTextColor={colors.textSecondary} value={title} onChangeText={setTitle} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.textInput, styles.textArea]} placeholder="Add details..." placeholderTextColor={colors.textSecondary} value={description} onChangeText={setDescription} multiline numberOfLines={3} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Frequency *</Text>
          <View style={styles.chipRow}>
            {(['daily', 'weekly'] as const).map((freq) => (
              <TouchableOpacity key={freq} style={[styles.chip, frequency === freq && styles.chipActive]} onPress={() => setFrequency(freq)}>
                <Text style={[styles.chipText, frequency === freq && styles.chipTextActive]}>{freq.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reminder</Text>
          <TouchableOpacity style={[styles.chip, reminderEnabled && styles.chipActive]} onPress={() => setReminderEnabled(!reminderEnabled)}>
            <Text style={[styles.chipText, reminderEnabled && styles.chipTextActive]}>{reminderEnabled ? '⏰ Reminder ON' : 'Reminder OFF'}</Text>
          </TouchableOpacity>

          {reminderEnabled ? (
            <TextInput style={[styles.textInput, { marginTop: spacing.sm }]} placeholder="Time in HH:mm (e.g. 08:00)" placeholderTextColor={colors.textSecondary} value={reminderTime} onChangeText={setReminderTime} />
          ) : null}
        </View>

        <View style={styles.buttonWrapper}>
          <Button variant="primary" label="Save Habit" isLoading={isSubmitting} onPress={handleCreate} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg },
  screenHeader: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg },
  errorCard: { backgroundColor: '#FEE2E2', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg },
  errorText: { ...typography.bodySmall, color: colors.error, fontWeight: '600' },
  inputGroup: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.xs },
  textInput: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, ...typography.body, color: colors.textPrimary },
  textArea: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, alignSelf: 'flex-start' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  buttonWrapper: { marginTop: spacing.md },
});
