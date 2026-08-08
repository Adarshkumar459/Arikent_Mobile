import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { CategoryChip } from '../../components/chips/CategoryChip';
import { ExpenseCard } from '../../components/cards/ExpenseCard';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseItem, MonthlyExpenseSummaryData, ExpenseCategory, ExpenseType } from '../../services/api/expenseApi';
import { ExpenseOptionsSheet } from '../../components/sheets/ExpenseOptionsSheet';
import { ExpenseLoadingScreen } from './ExpenseLoadingScreen';
import { ExpenseEmptyScreen } from './ExpenseEmptyScreen';
import { ExpenseErrorScreen } from './ExpenseErrorScreen';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'ExpenseList'>;

const CATEGORIES: Array<{ label: string; value?: ExpenseCategory }> = [
  { label: 'All' },
  { label: 'Food', value: 'food' },
  { label: 'Travel', value: 'travel' },
  { label: 'Bills', value: 'bills' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' },
  { label: 'Other', value: 'other' },
];

export const ExpensesScreen: React.FC<Props> = ({ route, navigation }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [summary, setSummary] = useState<MonthlyExpenseSummaryData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<ExpenseType | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected item for options sheet
  const [activeExpense, setActiveExpense] = useState<ExpenseItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchExpenses = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg(null);
    try {
      const [res, summaryData] = await Promise.all([
        ExpenseRepository.getExpenses({
          category: selectedCategory,
          type: selectedType,
        }),
        ExpenseRepository.getMonthlySummary(),
      ]);
      setExpenses(res.items);
      setSummary(summaryData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchExpenses(expenses.length === 0);
    });
    return unsubscribe;
  }, [navigation, selectedCategory, selectedType]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchExpenses(false);
  }, [selectedCategory, selectedType]);

  const handleOpenSheet = (item: ExpenseItem) => {
    setActiveExpense(item);
    setIsSheetOpen(true);
  };

  const handleDeleteActiveExpense = async () => {
    if (!activeExpense) return;
    try {
      await ExpenseRepository.deleteExpense(activeExpense.id);
      setIsSheetOpen(false);
      fetchExpenses(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete transaction');
    }
  };

  const handleDuplicateActiveExpense = async () => {
    if (!activeExpense) return;
    try {
      await ExpenseRepository.createExpense({
        type: activeExpense.type,
        amount: activeExpense.amount,
        category: activeExpense.category,
        paymentMethod: activeExpense.paymentMethod,
        date: activeExpense.date,
        note: activeExpense.note ? `${activeExpense.note} (Copy)` : 'Copy',
      });
      setIsSheetOpen(false);
      fetchExpenses(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to duplicate transaction');
    }
  };

  if (isLoading && !isRefreshing) {
    return <ExpenseLoadingScreen />;
  }

  if (errorMsg && expenses.length === 0) {
    return <ExpenseErrorScreen errorMessage={errorMsg} onRetry={() => fetchExpenses(true)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Expenses"
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('ExpenseAnalytics')}>
              <Text style={styles.headerIcon}>📈</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ExpenseFilter')}>
              <Text style={styles.headerIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Monthly Summary Card */}
      {summary ? (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Income</Text>
              <Text style={[styles.summaryAmount, styles.incomeColor]}>
                +₹{summary.totalIncome.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={[styles.summaryAmount, styles.expenseColor]}>
                -₹{summary.totalExpense.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Net Savings:</Text>
            <Text style={[styles.netAmount, summary.balance >= 0 ? styles.incomeColor : styles.expenseColor]}>
              ₹{summary.balance.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Category Filter Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.label}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <CategoryChip
              label={item.label}
              selected={selectedCategory === item.value}
              onPress={() => setSelectedCategory(item.value)}
            />
          )}
        />
      </View>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <ExpenseEmptyScreen />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ExpenseDetails', { expenseId: item.id })}
              onLongPress={() => handleOpenSheet(item)}
            >
              <ExpenseCard
                category={item.category}
                amount={item.amount}
                date={item.date ? new Date(item.date).toLocaleDateString() : undefined}
                paymentMethod={item.paymentMethod}
                type={item.type}
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Add Expense CTA */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Contextual Action Sheet */}
      <ExpenseOptionsSheet
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onEdit={() => {
          setIsSheetOpen(false);
          if (activeExpense) navigation.navigate('EditExpense', { expenseId: activeExpense.id });
        }}
        onDuplicate={handleDuplicateActiveExpense}
        onDelete={handleDeleteActiveExpense}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerIcon: {
    fontSize: 20,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.xs,
    ...elevation.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryBox: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryAmount: {
    ...typography.heading3,
    fontWeight: '700',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  netLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  netAmount: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  incomeColor: {
    color: colors.success,
  },
  expenseColor: {
    color: colors.error,
  },
  categoryContainer: {
    marginBottom: spacing.sm,
  },
  categoryList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
    gap: spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.large,
  },
  fabText: {
    color: colors.surface,
    fontSize: 32,
    fontWeight: '400',
    marginTop: -3,
  },
});
