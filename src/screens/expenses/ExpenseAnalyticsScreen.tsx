import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { ProgressBar } from '../../components/progress/ProgressBar';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseAnalyticsData } from '../../services/api/expenseApi';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'ExpenseAnalytics'>;

export const ExpenseAnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const [analytics, setAnalytics] = useState<ExpenseAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await ExpenseRepository.getAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Expense Analytics" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg || !analytics) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Expense Analytics" onBackPress={() => navigation.goBack()} />
        <View style={styles.content}>
          <ErrorState
            title="Analytics Unavailable"
            message={errorMsg || 'Failed to fetch expense breakdown'}
            onRetry={fetchAnalytics}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Expense Analytics" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>TOTAL MONTHLY SPENDING</Text>
          <Text style={styles.totalAmount}>₹{analytics.totalExpense.toLocaleString('en-IN')}</Text>
          <Text style={styles.monthText}>Month: {analytics.month}</Text>
        </View>

        <Text style={styles.sectionTitle}>CATEGORY BREAKDOWN</Text>

        {analytics.breakdown.length === 0 ? (
          <Text style={styles.emptyText}>No spending recorded for this month.</Text>
        ) : (
          <View style={styles.breakdownList}>
            {analytics.breakdown.map((item) => (
              <View key={item.category} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{item.category.toUpperCase()}</Text>
                  <Text style={styles.categoryAmount}>
                    ₹{item.total.toLocaleString('en-IN')} ({item.percentage}%)
                  </Text>
                </View>
                <ProgressBar progress={item.percentage} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
    ...elevation.medium,
  },
  cardLabel: {
    ...typography.caption,
    color: colors.softPurple,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  totalAmount: {
    ...typography.display,
    color: colors.surface,
    fontSize: 32,
  },
  monthText: {
    ...typography.bodySmall,
    color: colors.softPurple,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  breakdownList: {
    gap: spacing.md,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...elevation.small,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  categoryName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  categoryAmount: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
