import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheetContainer } from './BottomSheetContainer';
import { colors, spacing, typography } from '../../theme';
import { Button } from '../buttons/Button';

export interface GoalOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onUpdateProgress?: () => void;
  onDelete?: () => void;
}

export const GoalOptionsSheet: React.FC<GoalOptionsSheetProps> = ({
  visible,
  onClose,
  onEdit,
  onUpdateProgress,
  onDelete,
}) => {
  return (
    <BottomSheetContainer visible={visible} onClose={onClose}>
      <Text style={styles.title}>Goal Options</Text>
      <View style={styles.list}>
        <TouchableOpacity style={styles.option} onPress={() => { onClose(); onEdit?.(); }}>
          <Text style={styles.icon}>✏️</Text>
          <Text style={styles.optionText}>Edit Goal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => { onClose(); onUpdateProgress?.(); }}>
          <Text style={styles.icon}>📈</Text>
          <Text style={styles.optionText}>Update Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => { onClose(); onDelete?.(); }}>
          <Text style={styles.icon}>🗑️</Text>
          <Text style={[styles.optionText, styles.dangerText]}>Delete Goal</Text>
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
