import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NoteRepository } from '../../repositories/NoteRepository';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';

type Props = NativeStackScreenProps<any, 'CreateNote'>;

export const CreateNoteScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean);

    setIsSubmitting(true);
    try {
      await NoteRepository.createNote({
        title: title.trim(),
        content: content.trim(),
        tags,
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
        <Text style={styles.header}>Create Note</Text>
        <TextInput style={styles.input} placeholder="Title *" placeholderTextColor={colors.textSecondary} value={title} onChangeText={setTitle} />
        <TextInput style={[styles.input, styles.textArea]} placeholder="Content *" placeholderTextColor={colors.textSecondary} value={content} onChangeText={setContent} multiline numberOfLines={8} />
        <TextInput style={styles.input} placeholder="Tags comma-separated (e.g. work, mobile)" placeholderTextColor={colors.textSecondary} value={tagsText} onChangeText={setTagsText} />
        <Button variant="primary" label="Save Note" isLoading={isSubmitting} onPress={handleCreate} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  header: { ...typography.heading2, color: colors.textPrimary },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
  textArea: { height: 160, textAlignVertical: 'top' },
});
