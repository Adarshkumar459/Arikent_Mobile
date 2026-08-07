import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseAnalyticsData } from '../../services/api/expenseApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Loading } from '../../components/feedback/Loading';
import { EmptyState } from '../../components/feedback/EmptyState';

type Props = NativeStackScreenProps<MainStackParamList, 'ExpenseAnalytics'>;

export const ExpenseAnalyticsScreen: React.FC<Props> = () => {
  const [analytics, setAnalytics] = useState<ExpenseAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ExpenseRepository.getAnalytics().then((res) => {
      setAnalytics(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <Loading message="Loading analytics..." />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Category Analytics</Text>
      {analytics && analytics.breakdown.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.totalText}>Total Expenses: ₹{analytics.totalExpense.toLocaleString()}</Text>
          <View style={styles.list}>
            {analytics.breakdown.map((item) => (
              <View key={item.category} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.catName}>{item.category.toUpperCase()}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${item.percentage}%` }]} />
                  </View>
                </View>
                <Text style={styles.catVal}>₹{item.total.toLocaleString()} ({item.percentage}%)</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <EmptyState title="No Expense Data" description="No expense transactions found for this period." />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2, color: colors.textPrimary },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...elevation.small },
  totalText: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  list: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLeft: { flex: 1, marginRight: spacing.md },
  catName: { ...typography.bodySmall, fontWeight: '700', color: colors.textPrimary },
  barTrack: { height: 6, backgroundColor: colors.background, borderRadius: radius.full, marginTop: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  catVal: { ...typography.bodySmall, fontWeight: '700', color: colors.textSecondary },
});
