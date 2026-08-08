import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheetContainer } from './BottomSheetContainer';
import { colors, spacing, typography } from '../../theme';
import { Button } from '../buttons/Button';

export interface TaskOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onMarkCompleted?: () => void;
  onDelete?: () => void;
}

export const TaskOptionsSheet: React.FC<TaskOptionsSheetProps> = ({
  visible,
  onClose,
  onEdit,
  onDuplicate,
  onMarkCompleted,
  onDelete,
}) => {
  return (
    <BottomSheetContainer visible={visible} onClose={onClose}>
      <Text style={styles.title}>Task Options</Text>
      <View style={styles.list}>
        <TouchableOpacity style={styles.option} onPress={() => { onClose(); onEdit?.(); }}>
          <Text style={styles.icon}>✏️</Text>
          <Text style={styles.optionText}>Edit Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => { onClose(); onDuplicate?.(); }}>
          <Text style={styles.icon}>📋</Text>
          <Text style={styles.optionText}>Duplicate Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => { onClose(); onMarkCompleted?.(); }}>
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.optionText}>Mark as Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => { onClose(); onDelete?.(); }}>
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
  title: { ...typography.heading2, color: colors.textPrimary, marginBottom: spacing.md },
  list: { gap: spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  icon: { fontSize: 20 },
  optionText: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  dangerText: { color: colors.error },
  cancelWrapper: { marginTop: spacing.md },
});
