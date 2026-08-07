import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { CalendarRepository } from '../../repositories/CalendarRepository';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'EditEvent'>;

export const EditEventScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    CalendarRepository.getEventById(eventId).then((e) => {
      setTitle(e.title);
      setDescription(e.description || '');
      setIsLoading(false);
    });
  }, [eventId]);

  const handleUpdate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await CalendarRepository.updateEvent(eventId, { title: title.trim(), description: description.trim() || undefined });
      navigation.goBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading message="Loading event..." />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Edit Event</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={3} />
        <Button variant="primary" label="Save Changes" isLoading={isSubmitting} onPress={handleUpdate} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  header: { ...typography.h2, color: colors.textPrimary },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
  textArea: { height: 80, textAlignVertical: 'top' },
});
