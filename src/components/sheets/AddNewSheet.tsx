import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheetContainer } from './BottomSheetContainer';
import { colors, spacing, typography } from '../../theme';
import { SecondaryButton } from '../buttons';

export interface AddNewSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddTask?: () => void;
  onAddExpense?: () => void;
  onAddGoal?: () => void;
  onAddReminder?: () => void;
}

export const AddNewSheet: React.FC<AddNewSheetProps> = ({
  visible,
  onClose,
  onAddTask,
  onAddExpense,
  onAddGoal,
  onAddReminder,
}) => {
  return (
    <BottomSheetContainer visible={visible} onClose={onClose}>
      <Text style={styles.title}>Add New</Text>
      <Text style={styles.subtitle}>What would you like to add?</Text>

      <View style={styles.list}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            onClose();
            onAddTask?.();
          }}
          accessibilityRole="button"
          accessibilityLabel="Add Task"
        >
          <Text style={styles.icon}>📝</Text>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Add Task</Text>
            <Text style={styles.optionSub}>Track your daily todo items</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            onClose();
            onAddExpense?.();
          }}
          accessibilityRole="button"
          accessibilityLabel="Add Expense"
        >
          <Text style={styles.icon}>💸</Text>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Add Expense</Text>
            <Text style={styles.optionSub}>Log income or expense transaction</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            onClose();
            onAddGoal?.();
          }}
          accessibilityRole="button"
          accessibilityLabel="Add Goal"
        >
          <Text style={styles.icon}>🎯</Text>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Add Goal</Text>
            <Text style={styles.optionSub}>Set a target and track progress</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            onClose();
            onAddReminder?.();
          }}
          accessibilityRole="button"
          accessibilityLabel="Add Reminder"
        >
          <Text style={styles.icon}>⏰</Text>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Add Reminder</Text>
            <Text style={styles.optionSub}>Schedule a timely notification</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.cancelWrapper}>
        <SecondaryButton title="Cancel" onPress={onClose} />
      </View>
    </BottomSheetContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: {
    fontSize: 24,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cancelWrapper: {
    marginTop: spacing.lg,
  },
});
