import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';

export interface ToastProps {
  message: string;
}

export const SuccessToast: React.FC<ToastProps> = ({ message }) => {
  return (
    <View style={styles.toast}>
      <Text style={styles.icon}>✓</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    ...elevation.medium,
  },
  icon: { color: colors.success, fontSize: 16, fontWeight: '700' },
  message: { ...typography.bodySmall, color: colors.surface, fontWeight: '600' },
});
