import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radius } from '../../theme';

export interface BadgeProps {
  count?: number | string;
  variant?: 'primary' | 'success' | 'error' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({ count, variant = 'primary' }) => {
  const bg = variant === 'error' ? colors.error : variant === 'success' ? colors.success : variant === 'warning' ? colors.warning : colors.primary;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {count !== undefined ? <Text style={styles.text}>{count}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { ...typography.caption, fontSize: 10, color: colors.surface, fontWeight: '700' },
});
