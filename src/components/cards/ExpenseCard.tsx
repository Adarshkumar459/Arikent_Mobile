import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';

export interface ExpenseCardProps {
  category: string;
  amount: number;
  type?: 'income' | 'expense';
  date?: string;
  paymentMethod?: string;
  onPress?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  category,
  amount,
  type = 'expense',
  date,
  paymentMethod,
  onPress,
}) => {
  const amountColor = type === 'income' ? colors.success : colors.textPrimary;
  const prefix = type === 'income' ? '+' : '-';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.category}>{category.toUpperCase()}</Text>
        <View style={styles.metaRow}>
          {date ? <Text style={styles.metaText}>{date}</Text> : null}
          {paymentMethod ? <Text style={styles.metaText}>• {paymentMethod}</Text> : null}
        </View>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {prefix}₹{amount.toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.small,
  },
  left: { flex: 1, gap: 2 },
  category: { ...typography.heading3, color: colors.textPrimary },
  metaRow: { flexDirection: 'row', gap: spacing.xs },
  metaText: { ...typography.caption, color: colors.textSecondary },
  amount: { ...typography.heading3, fontWeight: '700' },
});
