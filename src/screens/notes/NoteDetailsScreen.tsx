import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { NoteRepository } from '../../repositories/NoteRepository';
import { NoteItem } from '../../services/api/noteApi';

type Props = NativeStackScreenProps<NotesStackParamList, 'NoteDetails'>;

export const NoteDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { noteId } = route.params || {};
  const [note, setNote] = useState<NoteItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNote = async () => {
    if (!noteId) return;
    setIsLoading(true);
    try {
      const data = await NoteRepository.getNoteById(noteId);
      setNote(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch note');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNote();
    });
    return unsubscribe;
  }, [navigation, noteId]);

  const handleDelete = () => {
    if (!noteId) return;
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await NoteRepository.deleteNote(noteId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const handleTogglePin = async () => {
    if (!noteId || !note) return;
    try {
      const updated = await NoteRepository.togglePin(noteId, !note.isPinned);
      setNote(updated);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to pin note');
    }
  };

  const getTimeLabel = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (isLoading || !note) {
    return (
      <View style={styles.safeArea}>
        <ScreenHeader title="Note" />
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScreenHeader
        title="Note"
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('EditNote', { noteId: note.id })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Note header */}
        <View style={styles.noteHeaderSection}>
          <View style={styles.metaRow}>
            {note.category && (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>
                  {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                </Text>
              </View>
            )}
            {note.isPinned && (
              <View style={styles.pinnedPill}>
                <Text style={styles.pinnedPillText}>📌 Pinned</Text>
              </View>
            )}
            <Text style={styles.timeLabel}>{getTimeLabel(note.updatedAt)}</Text>
          </View>

          <Text style={styles.noteTitle}>{note.title}</Text>
        </View>

        {/* Note content */}
        <View style={styles.noteContentCard}>
          <Text style={styles.noteContent}>{note.content}</Text>
        </View>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsSectionLabel}>TAGS</Text>
            <View style={styles.tagsRow}>
              {note.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.pinBtn} onPress={handleTogglePin} activeOpacity={0.85}>
            <Text style={styles.pinBtnText}>{note.isPinned ? '📌 Unpin' : '📌 Pin Note'}</Text>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditNote', { noteId: note.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
              <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: spacing.lg, gap: spacing.xl, paddingBottom: 40 },
  editIcon: { fontSize: 18 },

  noteHeaderSection: { gap: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  categoryPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  categoryPillText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  pinnedPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  pinnedPillText: {
    ...typography.caption,
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  timeLabel: { ...typography.caption, fontSize: 12, color: colors.outline },
  noteTitle: {
    ...typography.heading1,
    fontSize: 24,
    color: colors.onSurface,
    fontWeight: '800',
    lineHeight: 32,
  },

  noteContentCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...elevation.small,
  },
  noteContent: {
    ...typography.body,
    fontSize: 15,
    color: colors.onSurface,
    lineHeight: 24,
  },

  tagsSection: { gap: spacing.xs },
  tagsSectionLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.outline,
    letterSpacing: 0.5,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tagChip: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  tagChipText: { ...typography.caption, fontSize: 12, color: colors.onSurfaceVariant },

  actionsSection: { gap: spacing.md },
  pinBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBtnText: { ...typography.heading4, fontSize: 15, color: colors.primary, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  editBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: { ...typography.heading4, fontSize: 14, color: colors.primary, fontWeight: '700' },
  deleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFDAD6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { ...typography.heading4, fontSize: 14, color: colors.error, fontWeight: '700' },
});
