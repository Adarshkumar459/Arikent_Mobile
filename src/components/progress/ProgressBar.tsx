import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius } from '../../theme';

export interface ProgressBarProps {
  percentage?: number;
  progress?: number;
  height?: number;
  barColor?: string;
  trackColor?: string;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  progress,
  height = 8,
  barColor = colors.primary,
  trackColor = colors.softPurple,
  showLabel = false,
  style,
}) => {
  const value = progress !== undefined ? progress : percentage !== undefined ? percentage : 0;
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height, backgroundColor: trackColor }, style]}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: barColor, height }]} />
      </View>
      {showLabel ? <Text style={styles.label}>{Math.round(clamped)}%</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', gap: 4 },
  track: { width: '100%', borderRadius: radius.full, overflow: 'hidden' },
  fill: { borderRadius: radius.full },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, alignSelf: 'flex-end' },
});
