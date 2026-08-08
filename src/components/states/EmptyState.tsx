import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../buttons/Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📋',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.buttonWrapper}>
          <Button variant="primary" label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconText: { fontSize: 28 },
  title: { ...typography.heading2, color: colors.textPrimary, textAlign: 'center' },
  description: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.md },
  buttonWrapper: { marginTop: spacing.md, width: '100%', maxWidth: 200 },
});
