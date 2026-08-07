import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseItem } from '../../services/api/expenseApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'ExpenseDetails'>;

export const ExpenseDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { expenseId } = route.params;
  const [expense, setExpense] = useState<ExpenseItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ExpenseRepository.getExpenseById(expenseId).then((e) => {
      setExpense(e);
      setIsLoading(false);
    });
  }, [expenseId]);

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await ExpenseRepository.deleteExpense(expenseId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (isLoading || !expense) return <Loading message="Loading transaction..." />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.amount, { color: expense.type === 'income' ? colors.success : colors.error }]}>
          {expense.type === 'income' ? '+' : '-'}₹{expense.amount.toLocaleString()}
        </Text>
        <Text style={styles.category}>Category: {expense.category.toUpperCase()}</Text>
        <Text style={styles.meta}>Date: {new Date(expense.date).toLocaleDateString()}</Text>
        {expense.note ? <Text style={styles.meta}>Note: {expense.note}</Text> : null}
      </View>

      <Button variant="secondary" label="Edit Transaction" onPress={() => navigation.navigate('EditExpense', { expenseId: expense.id })} />
      <Button variant="danger" label="Delete Transaction" onPress={handleDelete} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...elevation.small },
  amount: { ...typography.h1, fontWeight: '700' },
  category: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.xs },
  meta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
});
