import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NoteRepository } from '../../repositories/NoteRepository';
import { NoteItem } from '../../services/api/noteApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/feedback/EmptyState';

type Props = NativeStackScreenProps<any, 'Notes'>;

export const NotesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotes = async (q?: string) => {
    setIsLoading(true);
    try {
      const res = await NoteRepository.getNotes({ q });
      setNotes(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => fetchNotes(searchQuery));
    return unsubscribe;
  }, [navigation, searchQuery]);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchNotes(searchQuery); }} colors={[colors.primary]} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Notes & Ideas</Text>
        <Button variant="primary" label="+ Add Note" onPress={() => navigation.navigate('CreateNote')} />
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search notes by title, content or tags..."
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          fetchNotes(text);
        }}
      />

      {isLoading && !isRefreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : notes.length === 0 ? (
        <EmptyState title="No Notes Found" description="Capture thoughts, checklists and quick ideas." actionLabel="+ Add Note" onAction={() => navigation.navigate('CreateNote')} />
      ) : (
        <View style={styles.list}>
          {notes.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card} onPress={() => navigation.navigate('NoteDetails', { noteId: item.id })}>
              <View style={styles.cardHeader}>
                <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
                {item.isPinned ? <Text style={styles.pinBadge}>📌 Pinned</Text> : null}
              </View>
              <Text style={styles.noteSnippet} numberOfLines={2}>{item.content}</Text>
              {item.tags.length > 0 ? (
                <View style={styles.tagRow}>
                  {item.tags.map((t) => (
                    <Text key={t} style={styles.tagText}>#{t}</Text>
                  ))}
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.heading2, color: colors.textPrimary },
  searchInput: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
  list: { gap: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, ...elevation.small },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteTitle: { ...typography.heading3, color: colors.textPrimary, flex: 1 },
  pinBadge: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  noteSnippet: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  tagRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' },
  tagText: { ...typography.caption, color: colors.primary, fontSize: 11 },
});
