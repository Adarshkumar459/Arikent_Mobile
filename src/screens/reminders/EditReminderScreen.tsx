import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';

type Props = NativeStackScreenProps<any, 'EditReminder'>;

export const EditReminderScreen: React.FC<Props> = ({ route, navigation }) => {
  const { reminderId } = (route.params || {}) as any;
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reminderId) {
      ReminderRepository.getReminderById(reminderId).then((r) => {
        setTitle(r.title);
        setIsLoading(false);
      });
    }
  }, [reminderId]);

  const handleUpdate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await ReminderRepository.updateReminder(reminderId, { title: title.trim() });
      navigation.goBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading message="Loading reminder..." />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Edit Reminder" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />
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
