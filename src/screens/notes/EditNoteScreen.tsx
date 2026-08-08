import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NoteRepository } from '../../repositories/NoteRepository';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<any, 'EditNote'>;

export const EditNoteScreen: React.FC<Props> = ({ route, navigation }) => {
  const { noteId } = (route.params || {}) as any;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    NoteRepository.getNoteById(noteId).then((n) => {
      setTitle(n.title);
      setContent(n.content);
      setTagsText(n.tags.join(', '));
      setIsLoading(false);
    });
  }, [noteId]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) return;
    const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean);
    setIsSubmitting(true);
    try {
      await NoteRepository.updateNote(noteId, { title: title.trim(), content: content.trim(), tags });
      navigation.goBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading message="Loading note..." />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Edit Note</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        <TextInput style={[styles.input, styles.textArea]} value={content} onChangeText={setContent} multiline numberOfLines={8} />
        <TextInput style={styles.input} value={tagsText} onChangeText={setTagsText} placeholder="Tags" />
        <Button variant="primary" label="Save Changes" isLoading={isSubmitting} onPress={handleUpdate} />
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
