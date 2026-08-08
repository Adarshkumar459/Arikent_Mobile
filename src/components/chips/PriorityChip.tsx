import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';

export interface PriorityChipProps {
  priority: 'high' | 'medium' | 'low' | string;
  selected?: boolean;
  onPress?: () => void;
}

export const PriorityChip: React.FC<PriorityChipProps> = ({ priority, selected, onPress }) => {
  const norm = priority.toLowerCase();
  const bg = selected
    ? colors.primary
    : norm === 'high'
    ? colors.errorBackground
    : norm === 'medium'
    ? colors.warningBackground
    : colors.successBackground;
  const textColor = selected
    ? colors.surface
    : norm === 'high'
    ? colors.error
    : norm === 'medium'
    ? colors.warning
    : colors.success;

  const content = (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: textColor }]}>{priority.toUpperCase()}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: { ...typography.caption, fontSize: 10, fontWeight: '700' },
});
