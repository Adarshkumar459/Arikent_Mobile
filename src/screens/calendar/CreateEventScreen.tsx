import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarRepository } from '../../repositories/CalendarRepository';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';

type Props = NativeStackScreenProps<any, 'CreateEvent'>;

export const CreateEventScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState(new Date().toISOString());
  const [endAt, setEndAt] = useState(new Date(Date.now() + 3600000).toISOString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await CalendarRepository.createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        startAt,
        endAt,
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
      <ScreenHeader title="Create Event" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput style={styles.input} placeholder="Title *" placeholderTextColor={colors.textSecondary} value={title} onChangeText={setTitle} />
        <TextInput style={[styles.input, styles.textArea]} placeholder="Description" placeholderTextColor={colors.textSecondary} value={description} onChangeText={setDescription} multiline numberOfLines={3} />
        <TextInput style={styles.input} placeholder="Start Time ISO" value={startAt} onChangeText={setStartAt} />
        <TextInput style={styles.input} placeholder="End Time ISO" value={endAt} onChangeText={setEndAt} />
        <Button variant="primary" label="Save Event" isLoading={isSubmitting} onPress={handleCreate} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
  textArea: { height: 80, textAlignVertical: 'top' },
});
