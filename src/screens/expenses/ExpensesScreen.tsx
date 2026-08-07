import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../navigation/types';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseItem, MonthlyExpenseSummaryData } from '../../services/api/expenseApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/feedback/EmptyState';

type Props = NativeStackScreenProps<MainStackParamList, 'Expenses'>;

export const ExpensesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [summary, setSummary] = useState<MonthlyExpenseSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchExpensesData = async () => {
    setIsLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        ExpenseRepository.getExpenses(),
        ExpenseRepository.getMonthlySummary(),
      ]);
      setExpenses(listRes.items);
      setSummary(sumRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchExpensesData);
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchExpensesData(); }} colors={[colors.primary]} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Expenses & Income</Text>
        <Button variant="primary" label="+ Log Transaction" onPress={() => navigation.navigate('CreateExpense')} />
      </View>

      {summary ? (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Monthly Overview ({summary.month})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExpenseAnalytics')}>
              <Text style={styles.analyticsLink}>Analytics →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>₹{summary.totalIncome.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Income</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.error }]}>₹{summary.totalExpense.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: summary.balance >= 0 ? colors.primary : colors.error }]}>₹{summary.balance.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Balance</Text>
            </View>
          </View>
        </View>
      ) : null}

      {isLoading && !isRefreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : expenses.length === 0 ? (
        <EmptyState title="No Transactions Logged" description="Track your income and expenses easily." actionLabel="+ Log Transaction" onAction={() => navigation.navigate('CreateExpense')} />
      ) : (
        <View style={styles.list}>
          {expenses.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card} onPress={() => navigation.navigate('ExpenseDetails', { expenseId: item.id })}>
              <View style={styles.cardLeft}>
                <Text style={styles.itemCategory}>{item.category.toUpperCase()}</Text>
                {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
              </View>
              <Text style={[styles.itemAmount, { color: item.type === 'income' ? colors.success : colors.error }]}>
                {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h2, color: colors.textPrimary },
  summaryCard: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...elevation.small },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  summaryTitle: { ...typography.h3, color: colors.textPrimary },
  analyticsLink: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statBox: { alignItems: 'center' },
  statNum: { ...typography.h3, fontWeight: '700' },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },
  list: { gap: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...elevation.small },
  cardLeft: { flex: 1 },
  itemCategory: { ...typography.h3, color: colors.textPrimary },
  itemNote: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  itemAmount: { ...typography.h3, fontWeight: '700' },
});
