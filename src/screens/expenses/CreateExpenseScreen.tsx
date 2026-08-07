import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseType, ExpenseCategory, PaymentMethod } from '../../services/api/expenseApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateExpense'>;

const CATEGORIES: ExpenseCategory[] = ['food', 'travel', 'bills', 'shopping', 'health', 'education', 'other'];

export const CreateExpenseScreen: React.FC<Props> = ({ navigation }) => {
  const [type, setType] = useState<ExpenseType>('expense');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    const amt = parseFloat(amountText.trim());
    if (isNaN(amt) || amt <= 0) return;

    setIsSubmitting(true);
    try {
      await ExpenseRepository.createExpense({
        type,
        amount: amt,
        category,
        paymentMethod,
        note: note.trim() || undefined,
      });
      navigation.goBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Add Transaction</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpense]} onPress={() => setType('expense')}>
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, type === 'income' && styles.typeBtnIncome]} onPress={() => setType('income')}>
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Income</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="Amount (e.g. 250) *" keyboardType="numeric" value={amountText} onChangeText={setAmountText} />
        
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={styles.input} placeholder="Notes (Optional)" value={note} onChangeText={setNote} />

        <Button variant="primary" label="Save Transaction" isLoading={isSubmitting} onPress={handleCreate} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  header: { ...typography.h2, color: colors.textPrimary },
  typeRow: { flexDirection: 'row', gap: spacing.md },
  typeBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  typeBtnExpense: { backgroundColor: colors.error, borderColor: colors.error },
  typeBtnIncome: { backgroundColor: colors.success, borderColor: colors.success },
  typeText: { ...typography.body, fontWeight: '700', color: colors.textSecondary },
  typeTextActive: { color: '#FFF' },
  label: { ...typography.label, color: colors.textPrimary },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
  chipRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  chip: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: '#FFF' },
});
