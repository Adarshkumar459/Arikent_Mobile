import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';

export interface TaskCardProps {
  title: string;
  description?: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low' | string;
  dueDate?: string;
  isCompleted?: boolean;
  completed?: boolean;
  onPress?: () => void;
  onToggleComplete?: () => void;
  onToggle?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  category,
  priority = 'medium',
  dueDate,
  isCompleted = false,
  completed,
  onPress,
  onToggleComplete,
  onToggle,
}) => {
  const done = completed !== undefined ? completed : isCompleted;
  const handleToggle = onToggle || onToggleComplete;

  const priorityColor =
    priority === 'high' ? colors.error : priority === 'medium' ? colors.warning : colors.success;
  const priorityBg =
    priority === 'high' ? colors.errorBackground : priority === 'medium' ? colors.warningBackground : colors.successBackground;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <TouchableOpacity style={styles.checkContainer} onPress={handleToggle}>
        <View style={[styles.checkbox, done && styles.checkedBox]}>
          {done ? <Text style={styles.checkMark}>✓</Text> : null}
        </View>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, done && styles.completedTitle]} numberOfLines={1}>
          {title}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          {priority ? (
            <View style={[styles.badge, { backgroundColor: priorityBg }]}>
              <Text style={[styles.badgeText, { color: priorityColor }]}>{priority.toUpperCase()}</Text>
            </View>
          ) : null}
          {category ? <Text style={styles.category}>{category}</Text> : null}
        </View>
      </View>
      {dueDate ? <Text style={styles.date}>{dueDate}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.small,
  },
  checkContainer: { marginRight: spacing.md },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: { backgroundColor: colors.primary },
  checkMark: { color: colors.surface, fontSize: 14, fontWeight: '700' },
  content: { flex: 1, gap: 4 },
  title: { ...typography.heading3, color: colors.textPrimary },
  description: { ...typography.bodySmall, color: colors.textSecondary },
  completedTitle: { textDecorationLine: 'line-through', color: colors.textDisabled },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badge: { paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { ...typography.caption, fontSize: 10, fontWeight: '700' },
  category: { ...typography.caption, color: colors.textSecondary },
  date: { ...typography.caption, color: colors.textSecondary },
});
