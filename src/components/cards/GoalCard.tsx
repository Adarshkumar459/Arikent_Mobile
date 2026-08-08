import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ProgressBar } from '../progress/ProgressBar';

export interface GoalCardProps {
  title: string;
  progress?: number;
  target?: number;
  current?: number;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  category?: string;
  deadline?: string;
  onPress?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  title,
  progress,
  target,
  current,
  currentValue,
  targetValue,
  unit,
  category,
  deadline,
  onPress,
}) => {
  const curr = currentValue !== undefined ? currentValue : current;
  const targ = targetValue !== undefined ? targetValue : target;
  const pct =
    progress !== undefined
      ? progress
      : curr !== undefined && targ && targ > 0
      ? Math.min(100, Math.max(0, (curr / targ) * 100))
      : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.percent}>{Math.round(pct)}%</Text>
      </View>

      <ProgressBar percentage={pct} />

      <View style={styles.footer}>
        {curr !== undefined && targ !== undefined ? (
          <Text style={styles.meta}>
            Progress: {curr} / {targ} {unit || ''}
          </Text>
        ) : null}
        {deadline ? <Text style={styles.meta}>Deadline: {deadline}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...elevation.small,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.heading3, color: colors.textPrimary, flex: 1 },
  percent: { ...typography.heading3, color: colors.primary, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { ...typography.caption, color: colors.textSecondary },
});
