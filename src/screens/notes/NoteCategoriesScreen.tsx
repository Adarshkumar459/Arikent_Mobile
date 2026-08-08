import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography, radius } from '../../theme';

type Props = NativeStackScreenProps<any, 'NoteCategories'>;

export const NoteCategoriesScreen: React.FC<Props> = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Note Categories & Tags</Text>
      <View style={styles.card}>
        <Text style={styles.cat}>General</Text>
        <Text style={styles.cat}>Work & Projects</Text>
        <Text style={styles.cat}>Personal & Ideas</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.heading2, color: colors.textPrimary },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, gap: spacing.sm },
  cat: { ...typography.body, fontWeight: '600', color: colors.primary },
});
