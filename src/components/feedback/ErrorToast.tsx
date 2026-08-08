import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ToastProps } from './SuccessToast';

export const ErrorToast: React.FC<ToastProps> = ({ message }) => {
  return (
    <View style={styles.toast}>
      <Text style={styles.icon}>⚠️</Text>
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
    borderLeftColor: colors.error,
    ...elevation.medium,
  },
  icon: { fontSize: 16 },
  message: { ...typography.bodySmall, color: colors.surface, fontWeight: '600' },
});
