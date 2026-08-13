import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { ExpenseCard } from '../../components/cards/ExpenseCard';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseItem, MonthlyExpenseSummaryData } from '../../services/api/expenseApi';
import { ExpenseLoadingScreen } from './ExpenseLoadingScreen';
import { ExpenseEmptyScreen } from './ExpenseEmptyScreen';
import { ExpenseErrorScreen } from './ExpenseErrorScreen';
import { useTabNav } from '../../context/TabContext';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'ExpenseList'>;

export const ExpensesScreen: React.FC<Props> = ({ navigation }) => {
  const { switchTab } = useTabNav();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [summary, setSummary] = useState<MonthlyExpenseSummaryData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchExpenseData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg(null);
    try {
      const [listRes, summaryRes] = await Promise.allSettled([
        ExpenseRepository.getExpenses(),
        ExpenseRepository.getMonthlySummary(),
      ]);

      if (listRes.status === 'fulfilled') {
        setExpenses(listRes.value.items);
      }
      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchExpenseData(expenses.length === 0);
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchExpenseData(false);
  }, []);

  const totalSpent = summary?.totalExpense ?? expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalCount = summary?.transactionCount ?? expenses.length;
  const thisMonthSpent = summary?.totalExpense ?? Math.round(totalSpent * 0.5);

  if (isLoading && !isRefreshing) {
    return <ExpenseLoadingScreen />;
  }

  if (errorMsg && expenses.length === 0) {
    return <ExpenseErrorScreen errorMessage={errorMsg} onRetry={() => fetchExpenseData(true)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Screen Header matching Goal & Calendar pages SAME TO SAME */}
      <ScreenHeader
        title="Expenses"
        onBackPress={() => switchTab('Home')}
        rightAction={
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('ExpenseAnalytics')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.headerIconText}>📊</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Total Spent Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryTopRow}>
                <View>
                  <Text style={styles.summaryCaption}>TOTAL SPENT</Text>
                  <Text style={styles.summaryAmount}>₹{totalSpent.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.trendBadge}>
                  <Text style={styles.trendIcon}>📈</Text>
                </View>
              </View>

              <View style={styles.summaryBottomGrid}>
                <View style={styles.summaryCell}>
                  <Text style={styles.cellCaption}>This Month</Text>
                  <Text style={styles.cellValue}>₹{thisMonthSpent.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.cellDivider} />
                <View style={styles.summaryCell}>
                  <Text style={styles.cellCaption}>Number of Expenses</Text>
                  <Text style={styles.cellValue}>{totalCount}</Text>
                </View>
              </View>
            </View>

            {/* Add Expense Full-Width CTA */}
            <TouchableOpacity
              style={styles.addCtaButton}
              onPress={() => navigation.navigate('AddExpense')}
              activeOpacity={0.9}
            >
              <Text style={styles.addCtaText}>+ Add Expense</Text>
            </TouchableOpacity>

            {/* Recent List Header Row */}
            <View style={styles.listHeaderRow}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => navigation.navigate('ExpenseFilter')}
                activeOpacity={0.7}
              >
                <Text style={styles.filterIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={<ExpenseEmptyScreen />}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ExpenseCard
              title={item.note || item.category.toUpperCase()}
              category={item.category}
              amount={item.amount}
              type={item.type}
              date={item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined}
              paymentMethod={item.paymentMethod}
              notes={item.note}
              onPress={() => navigation.navigate('ExpenseDetails', { expenseId: item.id })}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerIconButton: {
    padding: 4,
  },
  headerIconText: {
    fontSize: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 24,
    padding: spacing.lg,
    ...elevation.large,
    overflow: 'hidden',
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  summaryCaption: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.onPrimaryContainer + 'CC',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryAmount: {
    ...typography.display,
    fontSize: 34,
    color: colors.textLight,
  },
  trendBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.textLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 18,
  },
  summaryBottomGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.textLight + '30',
    paddingTop: spacing.md,
  },
  summaryCell: {
    flex: 1,
  },
  cellCaption: {
    ...typography.caption,
    fontSize: 12,
    color: colors.onPrimaryContainer + 'D9',
  },
  cellValue: {
    ...typography.heading4,
    fontSize: 16,
    color: colors.textLight,
    marginTop: 2,
  },
  cellDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.textLight + '30',
    marginHorizontal: spacing.sm,
  },
  addCtaButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.medium,
  },
  addCtaText: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.textLight,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 20,
    color: colors.onSurface,
  },
  filterButton: {
    padding: 6,
  },
  filterIcon: {
    fontSize: 18,
  },
  cardWrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
});
