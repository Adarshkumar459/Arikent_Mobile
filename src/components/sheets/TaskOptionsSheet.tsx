import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheetContainer } from './BottomSheetContainer';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../buttons/Button';

export interface TaskOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onSnooze?: (minutes: number) => void;
  onMarkCompleted?: () => void;
  onDelete?: () => void;
}

export const TaskOptionsSheet: React.FC<TaskOptionsSheetProps> = ({
  visible,
  onClose,
  onEdit,
  onSnooze,
  onMarkCompleted,
  onDelete,
}) => {
  return (
    <BottomSheetContainer visible={visible} onClose={onClose}>
      <Text style={styles.title}>Task Options & Snooze</Text>
      
      {/* Quick Snooze Options Grid */}
      <Text style={styles.sectionHeader}>QUICK SNOOZE</Text>
      <View style={styles.snoozeGrid}>
        <TouchableOpacity
          style={styles.snoozeChip}
          onPress={() => {
            onClose();
            onSnooze?.(30);
          }}
        >
          <Text style={styles.snoozeChipIcon}>⏱️</Text>
          <Text style={styles.snoozeChipText}>+30 mins</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.snoozeChip}
          onPress={() => {
            onClose();
            onSnooze?.(60);
          }}
        >
          <Text style={styles.snoozeChipIcon}>⏳</Text>
          <Text style={styles.snoozeChipText}>+1 hour</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.snoozeChip}
          onPress={() => {
            onClose();
            onSnooze?.(1440); // 24 hours
          }}
        >
          <Text style={styles.snoozeChipIcon}>🌅</Text>
          <Text style={styles.snoozeChipText}>Tomorrow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.snoozeChip}
          onPress={() => {
            onClose();
            onSnooze?.(10080); // 7 days
          }}
        >
          <Text style={styles.snoozeChipIcon}>📅</Text>
          <Text style={styles.snoozeChipText}>Next Week</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            onClose();
            onEdit?.();
          }}
        >
          <Text style={styles.icon}>✏️</Text>
          <Text style={styles.optionText}>Edit Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            onClose();
            onMarkCompleted?.();
          }}
        >
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.optionText}>Mark as Completed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            onClose();
            onDelete?.();
          }}
        >
          <Text style={styles.icon}>🗑️</Text>
          <Text style={[styles.optionText, styles.dangerText]}>Delete Task</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cancelWrapper}>
        <Button variant="secondary" label="Cancel" onPress={onClose} />
      </View>
    </BottomSheetContainer>
  );
};

const styles = StyleSheet.create({
  title: { ...typography.heading2, color: colors.textPrimary, marginBottom: spacing.sm },
  sectionHeader: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.outline,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  snoozeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  snoozeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  snoozeChipIcon: { fontSize: 13 },
  snoozeChipText: { ...typography.caption, fontSize: 12, fontWeight: '600', color: colors.onSurface },
  list: { gap: spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: { fontSize: 20 },
  optionText: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  dangerText: { color: colors.error },
  cancelWrapper: { marginTop: spacing.md },
});
