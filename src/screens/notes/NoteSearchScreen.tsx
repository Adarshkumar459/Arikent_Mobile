import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NoteRepository } from '../../repositories/NoteRepository';
import { NoteItem } from '../../services/api/noteApi';
import { colors, spacing, typography, radius } from '../../theme';

type Props = NativeStackScreenProps<any, 'NoteSearch'>;

export const NoteSearchScreen: React.FC<Props> = ({ navigation }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<NoteItem[]>([]);

  const handleSearch = async (text: string) => {
    setQ(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    const res = await NoteRepository.getNotes({ q: text });
    setResults(res.items);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Search Notes</Text>
      <TextInput style={styles.input} placeholder="Search title, content or tags..." value={q} onChangeText={handleSearch} autoFocus />
      <View style={styles.list}>
        {results.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => navigation.navigate('NoteDetails', { noteId: item.id })}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.heading2, color: colors.textPrimary },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
  list: { gap: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  cardTitle: { ...typography.heading3, color: colors.textPrimary },
  cardContent: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
});
