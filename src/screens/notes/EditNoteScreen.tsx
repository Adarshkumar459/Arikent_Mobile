import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { NoteRepository } from '../../repositories/NoteRepository';
import { useCustomAlert } from '../../components/alerts/CustomAlert';

type Props = NativeStackScreenProps<NotesStackParamList, 'EditNote'>;

const CATEGORIES = ['Personal', 'Work', 'Ideas', 'Important', 'Other'];

export const EditNoteScreen: React.FC<Props> = ({ navigation, route }) => {
  const { noteId } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');
  const [tagsText, setTagsText] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert, CustomAlertModal } = useCustomAlert();

  const fetchNote = async () => {
    if (!noteId) return;
    try {
      const data = await NoteRepository.getNoteById(noteId);
      setTitle(data.title);
      setContent(data.content);
      setCategory(data.category ? data.category.charAt(0).toUpperCase() + data.category.slice(1) : 'Personal');
      setTagsText(data.tags ? data.tags.join(', ') : '');
      setIsPinned(data.isPinned);
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to fetch note', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  const handleSave = async () => {
    if (!title.trim() || !noteId) {
      showAlert('Required Field', 'Please enter a note title', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await NoteRepository.updateNote(noteId, {
        title: title.trim(),
        content: content.trim(),
        category: category.toLowerCase(),
        isPinned,
      });
      navigation.goBack();
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to update note', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.safeArea}>
        <ScreenHeader title="Edit Note" />
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
        title="Edit Note"
        rightAction={
          isSubmitting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveHeaderBtnText}>Save</Text>
            </TouchableOpacity>
          )
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View style={styles.titleContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Note title"
            placeholderTextColor={colors.outline}
            value={title}
            onChangeText={setTitle}
            multiline={false}
          />
        </View>

        <View style={styles.divider} />

        {/* Body */}
        <TextInput
          style={styles.bodyInput}
          placeholder="Start writing..."
          placeholderTextColor={colors.outline}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {/* Options Card */}
        <View style={styles.optionsCard}>
          <Text style={styles.optionLabel}>CATEGORY</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.optionDivider} />

          <View style={styles.pinRow}>
            <View style={styles.pinLeft}>
              <View style={styles.pinIconBox}>
                <Text style={{ fontSize: 18 }}>📌</Text>
              </View>
              <View>
                <Text style={styles.pinTitle}>Pin Note</Text>
                <Text style={styles.pinSubtitle}>Keep this note at the top of your list</Text>
              </View>
            </View>
            <Switch
              value={isPinned}
              onValueChange={setIsPinned}
              trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryContainer }}
              thumbColor={colors.surfaceContainerLowest}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.saveBtnText}>✓ Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
      <CustomAlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: spacing.lg, paddingBottom: 90, gap: spacing.md },

  saveHeaderBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  saveHeaderBtnText: { ...typography.caption, fontSize: 13, color: colors.primary, fontWeight: '700' },

  titleContainer: { paddingVertical: spacing.sm },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
    paddingBottom: spacing.sm,
  },
  divider: { height: 1, backgroundColor: colors.surfaceContainerHighest },
  bodyInput: {
    fontSize: 15,
    color: colors.onSurface,
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
  },

  optionsCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    gap: spacing.md,
    ...elevation.small,
  },
  optionLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.outline,
    letterSpacing: 0.5,
  },
  categoryRow: { gap: spacing.xs },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  categoryChipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
  categoryChipText: { ...typography.caption, fontSize: 13, color: colors.onSurfaceVariant },
  categoryChipTextActive: { color: colors.textLight, fontWeight: '700' },

  optionDivider: { height: 1, backgroundColor: colors.surfaceContainerHighest },

  pinRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pinLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  pinIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinTitle: { ...typography.heading4, fontSize: 15, color: colors.onSurface, fontWeight: '700' },
  pinSubtitle: { ...typography.caption, fontSize: 12, color: colors.outline },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.small,
  },
  saveBtnText: { ...typography.heading4, fontSize: 16, color: colors.textLight, fontWeight: '700' },
});
