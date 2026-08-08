import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';

export interface ReminderCardProps {
  title: string;
  scheduledAt?: string;
  time?: string;
  date?: string;
  category?: string;
  onPress?: () => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ title, scheduledAt, time, date, category, onPress }) => {
  const displayTime = time || scheduledAt || date || '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {displayTime ? <Text style={styles.time}>{displayTime}</Text> : null}
      </View>
      {category ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{category.toUpperCase()}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.small,
  },
  left: { flex: 1, gap: 2 },
  title: { ...typography.heading3, color: colors.textPrimary },
  time: { ...typography.caption, color: colors.textSecondary },
  badge: { backgroundColor: colors.softPurple, paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { ...typography.caption, fontSize: 10, color: colors.primary, fontWeight: '700' },
});
