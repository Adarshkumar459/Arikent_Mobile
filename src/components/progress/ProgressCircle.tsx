import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radius } from '../../theme';

export interface ProgressCircleProps {
  percentage: number;
  size?: number;
  centerLabel?: string;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = 120,
  centerLabel,
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <View style={[styles.outer, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.inner, { width: size - 20, height: size - 20, borderRadius: (size - 20) / 2 }]}>
        <Text style={styles.percentText}>{Math.round(clamped)}%</Text>
        {centerLabel ? <Text style={styles.labelText}>{centerLabel}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: colors.primary,
  },
  inner: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
  },
  percentText: { ...typography.heading1, color: colors.primary, fontWeight: '700' },
  labelText: { ...typography.caption, color: colors.textSecondary },
});
