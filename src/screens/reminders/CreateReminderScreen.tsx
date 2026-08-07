import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { ReminderType } from '../../services/api/reminderApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateReminder'>;

export const CreateReminderScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReminderType>('bill');
  const [scheduledAt, setScheduledAt] = useState(new Date(Date.now() + 86400000).toISOString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await ReminderRepository.createReminder({
        title: title.trim(),
        type,
        scheduledAt,
      });
      navigation.goBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Create Reminder</Text>
        <TextInput style={styles.input} placeholder="Title (e.g. Pay Electricity Bill)" placeholderTextColor={colors.textSecondary} value={title} onChangeText={setTitle} />
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {(['task', 'bill', 'goal', 'calendar', 'general'] as const).map((t) => (
            <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}>
              <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput style={styles.input} placeholder="Scheduled ISO String" value={scheduledAt} onChangeText={setScheduledAt} />
        <Button variant="primary" label="Save Reminder" isLoading={isSubmitting} onPress={handleCreate} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  header: { ...typography.h2, color: colors.textPrimary },
  label: { ...typography.label, color: colors.textPrimary },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
  chipRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  chip: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: '#FFF' },
});
