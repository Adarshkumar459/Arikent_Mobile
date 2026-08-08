import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { PrimaryButton, SecondaryButton, DangerButton } from '../../components/buttons';
import { StatusChip, CategoryChip } from '../../components/chips';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseItem } from '../../services/api/expenseApi';
import { ExpenseOptionsSheet } from '../../components/sheets/ExpenseOptionsSheet';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'ExpenseDetails'>;

export const ExpenseDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const expenseId = route.params?.expenseId;
  const [expense, setExpense] = useState<ExpenseItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const fetchExpense = async () => {
    if (!expenseId) return;
    setIsLoading(true);
    try {
      const data = await ExpenseRepository.getExpenseById(expenseId);
      setExpense(data);
    } catch (err) {
      setExpense(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchExpense();
    });
    return unsubscribe;
  }, [navigation, expenseId]);

  const handleDelete = () => {
    if (!expense) return;
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ExpenseRepository.deleteExpense(expense.id);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete transaction');
          }
        },
      },
    ]);
  };

  const handleDuplicate = async () => {
    if (!expense) return;
    try {
      await ExpenseRepository.createExpense({
        type: expense.type,
        amount: expense.amount,
        category: expense.category,
        paymentMethod: expense.paymentMethod,
        date: expense.date,
        note: expense.note ? `${expense.note} (Copy)` : 'Copy',
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to duplicate transaction');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Expense Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!expense) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Expense Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Transaction not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isIncome = expense.type === 'income';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Expense Details"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={() => setIsOptionsOpen(true)}>
            <Text style={styles.optionsIcon}>•••</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <StatusChip status={isIncome ? 'Income' : ('Expense' as any)} />
            <CategoryChip label={expense.category} selected />
          </View>

          <Text style={[styles.amountText, isIncome ? styles.incomeColor : styles.expenseColor]}>
            {isIncome ? '+' : '-'}₹{expense.amount.toLocaleString('en-IN')}
          </Text>

          {expense.note ? (
            <Text style={styles.note}>{expense.note}</Text>
          ) : (
            <Text style={styles.noNote}>No notes provided.</Text>
          )}

          <View style={styles.metaDivider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment Method:</Text>
            <Text style={styles.metaValue}>{(expense.paymentMethod || 'cash').toUpperCase()}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date:</Text>
            <Text style={styles.metaValue}>{new Date(expense.date).toLocaleDateString()}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Logged On:</Text>
            <Text style={styles.metaValue}>{new Date(expense.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <SecondaryButton
            title="Edit Transaction"
            onPress={() => navigation.navigate('EditExpense', { expenseId: expense.id })}
          />
          <DangerButton title="Delete Transaction" onPress={handleDelete} />
        </View>
      </ScrollView>

      <ExpenseOptionsSheet
        visible={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        onEdit={() => navigation.navigate('EditExpense', { expenseId: expense.id })}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsIcon: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...elevation.small,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  amountText: {
    ...typography.display,
    fontSize: 36,
    marginTop: spacing.xs,
  },
  incomeColor: {
    color: colors.success,
  },
  expenseColor: {
    color: colors.error,
  },
  note: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  noNote: {
    ...typography.bodySmall,
    color: colors.textDisabled,
    fontStyle: 'italic',
  },
  metaDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
});
