import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';

export interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ label, selected = false, onPress }) => {
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label.toUpperCase()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  selectedText: { color: colors.surface },
});
