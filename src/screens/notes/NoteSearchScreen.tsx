import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { NoteRepository } from '../../repositories/NoteRepository';
import { NoteItem } from '../../services/api/noteApi';

type Props = NativeStackScreenProps<NotesStackParamList, 'NoteSearch'>;

const CATEGORY_COLORS: Record<string, string> = {
  personal: '#10B981',
  work: '#3B82F6',
  ideas: '#8B5CF6',
  important: '#EF4444',
  other: '#6C4CE8',
};

export const NoteSearchScreen: React.FC<Props> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await NoteRepository.getNotes({ q: q.trim() });
      setResults(res.items);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const getTimeLabel = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader title="Search Notes" />

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor={colors.outline}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : query.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.hintEmoji}>🔍</Text>
          <Text style={styles.hintText}>Start typing to search your notes</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.hintEmoji}>📭</Text>
          <Text style={styles.hintText}>No notes found for "{query}"</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.resultsList}>
          <Text style={styles.resultCount}>{results.length} note{results.length !== 1 ? 's' : ''} found</Text>
          {results.map((item) => {
            const catKey = (item.category || 'other').toLowerCase();
            const badgeColor = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.other;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.resultCard}
                onPress={() => navigation.navigate('NoteDetails', { noteId: item.id })}
                activeOpacity={0.88}
              >
                <View style={[styles.resultAccent, { backgroundColor: badgeColor }]} />
                <View style={styles.resultContent}>
                  <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.resultPreview} numberOfLines={2}>{item.content}</Text>
                  <View style={styles.resultFooter}>
                    <View style={[styles.categoryBadge, { backgroundColor: badgeColor + '20' }]}>
                      <Text style={[styles.categoryBadgeText, { color: badgeColor }]}>
                        {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'General'}
                      </Text>
                    </View>
                    <Text style={styles.resultTime}>{getTimeLabel(item.updatedAt)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  searchWrapper: { padding: spacing.lg, paddingBottom: spacing.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
    ...elevation.small,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.onSurface },
  clearBtn: { fontSize: 14, color: colors.outline, paddingHorizontal: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  hintEmoji: { fontSize: 40 },
  hintText: { ...typography.body, fontSize: 14, color: colors.outline },

  resultsList: { padding: spacing.lg, gap: spacing.md, paddingTop: spacing.sm },
  resultCount: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.outline,
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...elevation.small,
  },
  resultAccent: { width: 4 },
  resultContent: { flex: 1, padding: spacing.md, gap: 6 },
  resultTitle: { ...typography.heading4, fontSize: 15, color: colors.onSurface, fontWeight: '700' },
  resultPreview: { ...typography.body, fontSize: 13, color: colors.onSurfaceVariant, lineHeight: 18 },
  resultFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  categoryBadgeText: { ...typography.caption, fontSize: 11, fontWeight: '700' },
  resultTime: { ...typography.caption, fontSize: 11, color: colors.outline },
});
