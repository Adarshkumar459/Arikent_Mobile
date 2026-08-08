import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';

export interface StatusChipProps {
  status: 'active' | 'completed' | 'pending' | string;
  label?: string;
  selected?: boolean;
  onPress?: () => void;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, selected = false, onPress }) => {
  const getStyle = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { bg: colors.successBackground, text: colors.success };
      case 'pending':
        return { bg: colors.warningBackground, text: colors.warning };
      default:
        return { bg: colors.softPurple, text: colors.primary };
    }
  };

  const styleConfig = getStyle();
  const displayText = label || status.toUpperCase();

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? colors.primary : styleConfig.bg },
        selected && styles.selectedChip,
      ]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: selected ? colors.surface : styleConfig.text }]}>
        {displayText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  selectedChip: { borderWidth: 1, borderColor: colors.primary },
  text: { ...typography.caption, fontWeight: '700', fontSize: 11 },
});
