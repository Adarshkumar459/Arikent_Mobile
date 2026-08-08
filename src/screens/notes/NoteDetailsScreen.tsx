import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NoteRepository } from '../../repositories/NoteRepository';
import { NoteItem } from '../../services/api/noteApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<any, 'NoteDetails'>;

export const NoteDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { noteId } = (route.params || {}) as any;
  const [note, setNote] = useState<NoteItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    NoteRepository.getNoteById(noteId).then((n) => {
      setNote(n);
      setIsLoading(false);
    });
  }, [noteId]);

  const handleDelete = () => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await NoteRepository.deleteNote(noteId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (isLoading) return <Loading message="Loading note details..." />;
  if (!note) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{note.title}</Text>
        </View>
        <Text style={styles.content}>{note.content}</Text>
        {note.tags && note.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {note.tags.map((t) => (
              <Text key={t} style={styles.tag}>
                #{t}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      <Button variant="secondary" label="Edit Note" onPress={() => navigation.navigate('EditNote', { noteId: note.id })} />
      <Button variant="danger" label="Delete Note" onPress={handleDelete} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...elevation.small },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.heading2, color: colors.textPrimary, flex: 1 },
  content: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  tagRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md, flexWrap: 'wrap' },
  tag: { ...typography.caption, color: colors.primary, fontWeight: '700' },
});
