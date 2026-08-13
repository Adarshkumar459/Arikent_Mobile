import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseItem, ExpenseCategory, PaymentMethod } from '../../services/api/expenseApi';
import { useCustomAlert } from '../../components/alerts/CustomAlert';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { DatePickerModal } from '../../components/modals/DatePickerModal';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'EditExpense'>;

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

export const EditExpenseScreen: React.FC<Props> = ({ route, navigation }) => {
  const { expenseId } = route.params;

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { showAlert, CustomAlertModal } = useCustomAlert();

  useEffect(() => {
    const loadExpense = async () => {
      try {
        const item: ExpenseItem = await ExpenseRepository.getExpenseById(expenseId);
        setAmount(String(item.amount));
        setCategory(item.category || 'food');
        if (item.date) setDate(item.date.split('T')[0]);
        setPaymentMethod(item.paymentMethod || 'upi');
        setNotes(item.note || '');
      } catch (err: any) {
        showAlert('Error', err.message || 'Failed to load expense details', 'error', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    loadExpense();
  }, [expenseId]);

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showAlert('Validation Error', 'Please enter a valid expense amount', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const combinedNote = title.trim()
        ? notes.trim() ? `${title.trim()} - ${notes.trim()}` : title.trim()
        : notes.trim() || undefined;

      await ExpenseRepository.updateExpense(expenseId, {
        amount: numericAmount,
        category,
        date: formatIsoDate(date),
        paymentMethod,
        note: combinedNote,
      });
      navigation.goBack();
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to update expense', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await ExpenseRepository.deleteExpense(expenseId);
      setIsDeleteModalVisible(false);
      navigation.navigate('ExpenseList');
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to delete expense', 'error');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ScreenHeader matching Goal & Calendar pages SAME TO SAME */}
      <ScreenHeader
        title="Edit Expense"
        rightAction={
          <TouchableOpacity
            onPress={() => setIsDeleteModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.formCanvas} keyboardShouldPersistTaps="handled">
        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.primaryContainer + '60'}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Title Input Card */}
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

        {/* Category Selector */}
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

        {/* Date Picker Card */}
        <TouchableOpacity
          style={styles.dateCard}
          onPress={() => setIsDatePickerOpen(true)}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.cardLabel}>Date</Text>
            <Text style={styles.dateDisplayValue}>
              {date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Select Date'}
            </Text>
          </View>
          <Text style={styles.dateIcon}>📅</Text>
        </TouchableOpacity>

        {/* Payment Method Selector */}
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

        {/* Notes Card */}
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
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delete Modal */}
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Expense?"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
      />

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
      <CustomAlertModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: colors.primaryContainer,
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
