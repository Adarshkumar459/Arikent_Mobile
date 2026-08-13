import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { NoteRepository } from '../../repositories/NoteRepository';
import { NoteItem } from '../../services/api/noteApi';
import { useCustomAlert } from '../../components/alerts/CustomAlert';

type Props = NativeStackScreenProps<NotesStackParamList, 'NoteList'>;

const FILTER_TABS = ['All', 'Personal', 'Work', 'Ideas', 'Important'];

const CATEGORY_COLORS: Record<string, string> = {
  personal: '#10B981',
  work: '#3B82F6',
  ideas: '#8B5CF6',
  important: '#EF4444',
  other: '#6C4CE8',
};

const CATEGORY_BAR_COLORS: Record<string, string> = {
  personal: '#51DEAA',
  work: '#6C4CE8',
  ideas: '#603ED4',
  important: '#BA1A1A',
  other: '#6C4CE8',
};

export const NotesScreen: React.FC<Props> = ({ navigation }) => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showAlert, CustomAlertModal } = useCustomAlert();

  const fetchNotes = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await NoteRepository.getNotes({
        q: searchQuery || undefined,
        category: activeFilter !== 'All' ? activeFilter.toLowerCase() : undefined,
      });
      setNotes(res.items);
    } catch (err: any) {
      console.log('Error fetching notes:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotes(notes.length === 0);
    });
    return unsubscribe;
  }, [navigation, activeFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchNotes(false);
  }, [activeFilter, searchQuery]);

  const handleTogglePin = async (note: NoteItem) => {
    try {
      const updated = await NoteRepository.togglePin(note.id, !note.isPinned);
      setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to pin note', 'error');
    }
  };

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const regularNotes = notes.filter((n) => !n.isPinned);

  const getTimeLabel = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderNoteCard = (item: NoteItem) => {
    const catKey = (item.category || 'other').toLowerCase();
    const accentColor = CATEGORY_BAR_COLORS[catKey] || CATEGORY_BAR_COLORS.other;
    const badgeColor = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.other;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.noteCard}
        onPress={() => navigation.navigate('NoteDetails', { noteId: item.id })}
        onLongPress={() => handleTogglePin(item)}
        activeOpacity={0.88}
      >
        {/* Left color accent bar */}
        <View style={[styles.cardAccentBar, { backgroundColor: accentColor }]} />

        <View style={styles.cardInner}>
          {/* Header row */}
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.cardHeaderRight}>
              {item.isPinned && (
                <Text style={styles.pinIcon}>📌</Text>
              )}
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => navigation.navigate('NoteDetails', { noteId: item.id })}
              >
                <Text style={styles.moreIcon}>•••</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preview content */}
          <Text style={styles.cardPreview} numberOfLines={3}>
            {item.content || 'No content'}
          </Text>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={[styles.categoryBadge, { backgroundColor: badgeColor + '20' }]}>
              <Text style={[styles.categoryBadgeText, { color: badgeColor }]}>
                {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'General'}
              </Text>
            </View>
            <Text style={styles.cardTime}>{getTimeLabel(item.updatedAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScreenHeader
        title="Notes"
        subtitle="Your thoughts, captured."
        rightAction={
          <TouchableOpacity
            style={styles.headerSearchBtn}
            onPress={() => navigation.navigate('NoteSearch')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: 18 }}>🔍</Text>
          </TouchableOpacity>
        }
      />

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes..."
              placeholderTextColor={colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTER_TABS.map((tab) => {
              const active = activeFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setActiveFilter(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {notes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>No notes yet</Text>
              <Text style={styles.emptySubtitle}>Tap + to capture your thoughts</Text>
            </View>
          ) : (
            <>
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <View style={styles.sectionGroup}>
                  <Text style={styles.sectionLabel}>📌 PINNED</Text>
                  {pinnedNotes.map(renderNoteCard)}
                </View>
              )}

              {/* Recent Notes */}
              {regularNotes.length > 0 && (
                <View style={styles.sectionGroup}>
                  <Text style={styles.sectionLabel}>📝 RECENT NOTES</Text>
                  {regularNotes.map(renderNoteCard)}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateNote')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <CustomAlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 90 },
  headerSearchBtn: { padding: 4 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
    ...elevation.small,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
  },
  clearBtn: {
    fontSize: 14,
    color: colors.outline,
    paddingHorizontal: 4,
  },

  filterRow: { gap: spacing.xs, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  filterChipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
  filterChipText: { ...typography.caption, fontSize: 13, color: colors.onSurfaceVariant },
  filterChipTextActive: { color: colors.textLight, fontWeight: '700' },

  sectionGroup: { gap: spacing.sm },
  sectionLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.outline,
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  noteCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    minHeight: 120,
    ...elevation.small,
  },
  cardAccentBar: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardInner: { flex: 1, padding: spacing.md, gap: 6 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.xs,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pinIcon: { fontSize: 14 },
  moreIcon: { fontSize: 15, color: colors.outline, letterSpacing: -1 },
  cardPreview: {
    ...typography.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 19,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    paddingTop: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  categoryBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  cardTime: {
    ...typography.caption,
    fontSize: 11,
    color: colors.outline,
  },

  emptyCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    gap: spacing.sm,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { ...typography.heading4, fontSize: 16, color: colors.onSurface, fontWeight: '700' },
  emptySubtitle: { ...typography.body, fontSize: 13, color: colors.outline },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.large,
  },
  fabText: { color: colors.surface, fontSize: 32, fontWeight: '400', marginTop: -3 },
});
