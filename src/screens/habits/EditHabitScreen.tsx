import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HabitRepository } from '../../repositories/HabitRepository';
import { HabitFrequency, HabitStatus } from '../../services/api/habitApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';

type Props = NativeStackScreenProps<any, 'EditHabit'>;

export const EditHabitScreen: React.FC<Props> = ({ route, navigation }) => {
  const { habitId } = (route.params || {}) as any;
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [status, setStatus] = useState<HabitStatus>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habitId) {
      HabitRepository.getHabitById(habitId).then((h) => {
        setTitle(h.title);
        setDescription(h.description || '');
        setFrequency(h.frequency);
        setStatus(h.status);
        setIsLoading(false);
      });
    }
  }, [habitId]);

  const handleUpdate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await HabitRepository.updateHabit(habitId, { title: title.trim(), description: description.trim() || undefined, frequency, status });
      navigation.goBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading message="Loading habit..." />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Edit Habit" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Description" />
        <Button variant="primary" label="Save Changes" isLoading={isSubmitting} onPress={handleUpdate} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
});
