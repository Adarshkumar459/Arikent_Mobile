import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseCategory, PaymentMethod } from '../../services/api/expenseApi';
import { DatePickerModal } from '../../components/modals/DatePickerModal';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'AddExpense'>;

const CATEGORY_OPTIONS: { label: string; value: ExpenseCategory }[] = [
  { label: 'Food', value: 'food' },
  { label: 'Transport', value: 'travel' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Bills', value: 'bills' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' },
  { label: 'Other', value: 'other' },
];

const PAYMENT_METHOD_OPTIONS: { label: string; value: PaymentMethod }[] = [
  { label: 'Cash', value: 'cash' },
  { label: 'UPI', value: 'upi' },
  { label: 'Card', value: 'card' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Other', value: 'other' },
];

const formatIsoDate = (dateStr: string): string => {
  if (!dateStr.trim()) return new Date().toISOString();
  const parsed = new Date(dateStr.trim());
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

export const AddExpenseScreen: React.FC<Props> = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid expense amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedNote = title.trim()
        ? notes.trim() ? `${title.trim()} - ${notes.trim()}` : title.trim()
        : notes.trim() || undefined;

      await ExpenseRepository.createExpense({
        type: 'expense',
        amount: numericAmount,
        category,
        date: formatIsoDate(date),
        paymentMethod,
        note: combinedNote,
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ScreenHeader matching Goal & Calendar pages SAME TO SAME */}
      <ScreenHeader title="Add Expense" />

      <ScrollView contentContainerStyle={styles.formCanvas} keyboardShouldPersistTaps="handled">
        {/* 1. Large Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.primaryContainer + '60'}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </View>

        {/* 2. Title Input Card */}
        <View style={styles.cardInputGroup}>
          <Text style={styles.cardLabel}>Title</Text>
          <TextInput
            style={styles.cardTextInput}
            placeholder="What did you spend on?"
            placeholderTextColor={colors.outlineVariant}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* 3. Category Selector */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeading}>Category</Text>
          <View style={styles.chipsWrap}>
            {CATEGORY_OPTIONS.map((item) => {
              const selected = category === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.chip, selected && styles.selectedChip]}
                  onPress={() => setCategory(item.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, selected && styles.selectedChipText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. Date Picker Card */}
        <TouchableOpacity
          style={styles.dateCard}
          onPress={() => setIsDatePickerOpen(true)}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.cardLabel}>Date</Text>
            <Text style={styles.dateDisplayValue}>
              {new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <Text style={styles.dateIcon}>📅</Text>
        </TouchableOpacity>

        {/* 5. Payment Method Selector */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeading}>Payment Method</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChips}>
            {PAYMENT_METHOD_OPTIONS.map((item) => {
              const selected = paymentMethod === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.pmChip, selected && styles.selectedPmChip]}
                  onPress={() => setPaymentMethod(item.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pmChipText, selected && styles.selectedPmChipText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 6. Notes Card */}
        <View style={styles.cardInputGroup}>
          <Text style={styles.cardLabel}>Notes</Text>
          <TextInput
            style={[styles.cardTextInput, styles.notesTextArea]}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.outlineVariant}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={isDatePickerOpen}
        initialDate={date}
        onConfirm={(iso, formatted) => {
          setDate(formatted);
          setIsDatePickerOpen(false);
        }}
        onCancel={() => setIsDatePickerOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formCanvas: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 100,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: 4,
  },
  currencySymbol: {
    ...typography.display,
    fontSize: 44,
    color: colors.primary,
    fontWeight: '700',
  },
  amountInput: {
    ...typography.display,
    fontSize: 48,
    color: colors.primary,
    fontWeight: '700',
    minWidth: 160,
    textAlign: 'center',
  },
  cardInputGroup: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...elevation.small,
  },
  cardLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  cardTextInput: {
    fontSize: 16,
    color: colors.onSurface,
    paddingVertical: 4,
  },
  notesTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  sectionGroup: {
    gap: spacing.xs,
  },
  sectionHeading: {
    ...typography.heading4,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    ...elevation.small,
  },
  chipText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  selectedChipText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...elevation.small,
  },
  dateDisplayValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginTop: 2,
  },
  dateIcon: {
    fontSize: 22,
    color: colors.primary,
  },
  horizontalChips: {
    gap: spacing.xs,
  },
  pmChip: {
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    ...elevation.small,
  },
  selectedPmChip: {
    backgroundColor: colors.primaryContainer,
  },
  pmChipText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  selectedPmChipText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(252, 248, 251, 0.95)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant + '30',
  },
  saveButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.medium,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.textLight,
  },
});
