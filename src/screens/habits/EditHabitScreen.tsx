import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../navigation/types';
import { HabitRepository } from '../../repositories/HabitRepository';
import { HabitFrequency, HabitStatus } from '../../services/api/habitApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'EditHabit'>;

export const EditHabitScreen: React.FC<Props> = ({ route, navigation }) => {
  const { habitId } = route.params;
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [status, setStatus] = useState<HabitStatus>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    HabitRepository.getHabitById(habitId).then((h) => {
      setTitle(h.title);
      setDescription(h.description || '');
      setFrequency(h.frequency);
      setStatus(h.status);
      setIsLoading(false);
    });
  }, [habitId]);

  const handleUpdate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await HabitRepository.updateHabit(habitId, { title: title.trim(), description: description.trim() || undefined, frequency, status });
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading message="Loading habit..." />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}>
        <Text style={styles.header}>Edit Habit</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={3} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.chipRow}>
            {(['active', 'archived'] as const).map((st) => (
              <TouchableOpacity key={st} style={[styles.chip, status === st && styles.chipActive]} onPress={() => setStatus(st)}>
                <Text style={[styles.chipText, status === st && styles.chipTextActive]}>{st.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Button variant="primary" label="Save Changes" isLoading={isSubmitting} onPress={handleUpdate} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  header: { ...typography.h2, color: colors.textPrimary },
  inputGroup: { gap: spacing.xs },
  label: { ...typography.label, color: colors.textPrimary },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
  textArea: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: '#FFF' },
});
