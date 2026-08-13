import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { TaskStatus } from '../../services/api/taskApi';

export interface TaskCardProps {
  title: string;
  description?: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low' | string;
  status?: TaskStatus | string;
  dueDate?: string;
  completedAt?: string;
  progressPercent?: number;
  isCompleted?: boolean;
  completed?: boolean;
  onPress?: () => void;
  onToggleComplete?: () => void;
  onToggle?: () => void;
  onMorePress?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  category = 'Work',
  priority = 'medium',
  status = 'pending',
  dueDate,
  completedAt,
  progressPercent,
  isCompleted = false,
  completed,
  onPress,
  onToggleComplete,
  onToggle,
  onMorePress,
}) => {
  const done = completed !== undefined ? completed : isCompleted || status === 'completed';
  const handleToggle = onToggle || onToggleComplete;

  const pri = priority ? priority.toLowerCase() : 'medium';
  const isHigh = pri === 'high';
  const isMedium = pri === 'medium';
  const isInProgress = status === 'in_progress' || status === 'in-progress';

  // Left accent line color based on priority & status
  let borderLeftColor: string = colors.surfaceVariant;
  if (done) {
    borderLeftColor = colors.surfaceVariant;
  } else if (isHigh) {
    borderLeftColor = colors.error;
  } else if (isMedium) {
    borderLeftColor = colors.secondaryContainer;
  } else if (isInProgress) {
    borderLeftColor = colors.tertiary;
  }

  // Priority Pill Colors
  let priorityBg: string = colors.surfaceContainer;
  let priorityTextColor: string = colors.onSurfaceVariant;
  let priorityDotColor: string = colors.outline;

  if (isHigh) {
    priorityBg = colors.errorContainer;
    priorityTextColor = colors.onErrorContainer;
    priorityDotColor = colors.error;
  } else if (isMedium) {
    priorityBg = colors.primaryLight;
    priorityTextColor = colors.primary;
    priorityDotColor = colors.secondaryContainer;
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor },
        done && styles.completedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Custom Checkbox */}
      <TouchableOpacity
        style={styles.checkWrapper}
        onPress={handleToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={[styles.checkbox, done && styles.checkboxDone]}>
          {done && <Text style={styles.checkIcon}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Main Content Area */}
      <View style={styles.content}>
        <Text style={[styles.title, done && styles.completedTitle]} numberOfLines={2}>
          {title}
        </Text>

        {/* Badges Row */}
        <View style={styles.badgesRow}>
          {category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ) : null}

          {!done && (
            <View style={[styles.priorityBadge, { backgroundColor: priorityBg }]}>
              <View style={[styles.dot, { backgroundColor: priorityDotColor }]} />
              <Text style={[styles.priorityText, { color: priorityTextColor }]}>
                {isHigh ? 'High Priority' : isMedium ? 'Medium Priority' : 'Low Priority'}
              </Text>
            </View>
          )}
        </View>

        {/* Optional Progress Bar for In Progress tasks */}
        {isInProgress && !done && progressPercent !== undefined && (
          <View style={styles.progressTrack}>
            <View style={[styles.fillProgress, { width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }]} />
          </View>
        )}

        {/* Date / Status Caption */}
        <View style={styles.dateRow}>
          <Text style={styles.dateIcon}>{done ? '✓' : '📅'}</Text>
          <Text style={styles.dateText}>
            {done
              ? completedAt ? `Completed on ${completedAt}` : 'Completed'
              : dueDate ? dueDate : 'No due date'}
          </Text>
        </View>
      </View>

      {/* Context Options Button */}
      {onMorePress && (
        <TouchableOpacity
          style={styles.moreButton}
          onPress={onMorePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.moreIcon}>⋮</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderColor: 'transparent',
    gap: spacing.md,
    ...elevation.small,
  },
  completedCard: {
    opacity: 0.7,
  },
  checkWrapper: {
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxDone: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  checkIcon: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.outline,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  categoryText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  priorityText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHigh,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  fillProgress: {
    height: '100%',
    backgroundColor: colors.tertiary,
    borderRadius: radius.full,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateIcon: {
    fontSize: 12,
    color: colors.outline,
  },
  dateText: {
    ...typography.caption,
    color: colors.outline,
    fontSize: 12,
  },
  moreButton: {
    padding: 4,
    marginTop: -2,
  },
  moreIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.outline,
  },
});
