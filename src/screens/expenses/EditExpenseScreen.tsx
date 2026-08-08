import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TextInput, DateInput, DropdownInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseType, ExpenseCategory, PaymentMethod } from '../../services/api/expenseApi';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'EditExpense'>;

const CATEGORY_OPTIONS = [
  { label: 'Food', value: 'food' },
  { label: 'Travel', value: 'travel' },
  { label: 'Bills', value: 'bills' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' },
  { label: 'Other', value: 'other' },
];

const METHOD_OPTIONS = [
  { label: 'Cash', value: 'cash' },
  { label: 'UPI', value: 'upi' },
  { label: 'Card', value: 'card' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Other', value: 'other' },
];

export const EditExpenseScreen: React.FC<Props> = ({ route, navigation }) => {
  const expenseId = route.params?.expenseId;
  const [type, setType] = useState<ExpenseType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!expenseId) return;
    ExpenseRepository.getExpenseById(expenseId)
      .then((item) => {
        setType(item.type);
        setAmount(String(item.amount));
        setCategory(item.category);
        setPaymentMethod(item.paymentMethod || 'cash');
        setDate(item.date ? item.date.substring(0, 10) : '');
        setNote(item.note || '');
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Transaction not found');
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [expenseId]);

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Please enter a valid positive amount');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await ExpenseRepository.updateExpense(expenseId, {
        type,
        amount: numericAmount,
        category,
        paymentMethod,
        date: date.trim() || undefined,
        note: note.trim() || undefined,
      });
      setIsLoading(false);
      navigation.goBack();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to update transaction');
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Edit Transaction" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Edit Transaction" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {errorMsg ? (
            <ErrorState title="Error" message={errorMsg} onRetry={() => setErrorMsg(null)} retryLabel="Dismiss" />
          ) : null}

          {/* Type Segment Selector */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, type === 'expense' && styles.segmentActiveExpense]}
              onPress={() => setType('expense')}
            >
              <Text style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, type === 'income' && styles.segmentActiveIncome]}
              onPress={() => setType('income')}
            >
              <Text style={[styles.segmentText, type === 'income' && styles.segmentTextActive]}>Income</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            label="AMOUNT (₹)"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <DropdownInput
            label="CATEGORY"
            options={CATEGORY_OPTIONS}
            value={category}
            onSelect={(val) => setCategory(val as ExpenseCategory)}
          />

          <DropdownInput
            label="PAYMENT METHOD"
            options={METHOD_OPTIONS}
            value={paymentMethod}
            onSelect={(val) => setPaymentMethod(val as PaymentMethod)}
          />

          <DateInput
            label="DATE"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeDate={setDate}
          />

          <TextInput
            label="NOTE / DESCRIPTION"
            placeholder="e.g. Lunch with team"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />

          <View style={styles.actionWrapper}>
            <PrimaryButton
              title="Save Changes"
              onPress={handleSave}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.xs,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  segmentActiveExpense: {
    backgroundColor: colors.error,
  },
  segmentActiveIncome: {
    backgroundColor: colors.success,
  },
  segmentText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: colors.surface,
  },
  actionWrapper: {
    marginTop: spacing.md,
  },
});
