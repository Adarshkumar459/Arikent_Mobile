import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { DatePickerModal } from '../../components/modals/DatePickerModal';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'ExpenseFilter'>;

export const ExpenseFilterScreen: React.FC<Props> = ({ navigation }) => {
  const [dateRange, setDateRange] = useState<string>('This Month');
  const [category, setCategory] = useState<string>('All');
  const [paymentMethod, setPaymentMethod] = useState<string>('All');
  const [minAmount, setMinAmount] = useState<string>('0');
  const [maxAmount, setMaxAmount] = useState<string>('50000');
  const [sortBy, setSortBy] = useState<string>('Newest First');
  const [customDate, setCustomDate] = useState<string>('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  const handleReset = () => {
    setDateRange('This Month');
    setCategory('All');
    setPaymentMethod('All');
    setMinAmount('0');
    setMaxAmount('50000');
    setSortBy('Newest First');
    setCustomDate('');
  };

  const handleApply = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ScreenHeader matching Task, Expense & Goal pages SAME TO SAME */}
      <ScreenHeader
        title="Filter Expenses"
        rightAction={
          <TouchableOpacity
            onPress={handleReset}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.resetHeaderText}>Reset</Text>
          </TouchableOpacity>
        }
      />

      {/* Form Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date Range Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <View style={styles.chipsRow}>
            {['Today', 'This Week', 'This Month', 'Last Month', 'Custom Range'].map((item) => {
              const active = dateRange === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => {
                    setDateRange(item);
                    if (item === 'Custom Range') {
                      setIsDatePickerOpen(true);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item === 'Custom Range' && customDate ? `Custom (${customDate})` : item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.chipsRow}>
            {['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Other'].map((item) => {
              const active = category === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategory(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.chipsRow}>
            {['All', 'Cash', 'UPI', 'Debit Card', 'Credit Card'].map((item) => {
              const active = paymentMethod === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setPaymentMethod(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Amount Range Section */}
        <View style={styles.section}>
          <View style={styles.amountHeaderRow}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <Text style={styles.amountRangeDisplay}>₹{minAmount} - ₹{maxAmount}</Text>
          </View>

          <View style={styles.amountInputsRow}>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <TextInput
                style={styles.amountInputField}
                keyboardType="numeric"
                value={minAmount}
                onChangeText={setMinAmount}
              />
            </View>

            <Text style={styles.dashText}>-</Text>

            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <TextInput
                style={styles.amountInputField}
                keyboardType="numeric"
                value={maxAmount}
                onChangeText={setMaxAmount}
              />
            </View>
          </View>
        </View>

        {/* Sort By Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <View style={styles.radioList}>
            {['Newest First', 'Oldest First', 'Highest Amount', 'Lowest Amount'].map((item) => {
              const active = sortBy === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={styles.radioRow}
                  onPress={() => setSortBy(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.radioLabel, active && styles.radioLabelActive]}>
                    {item}
                  </Text>
                  <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                    {active && <View style={styles.innerDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.85}>
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Date Picker Modal for custom range */}
      <DatePickerModal
        visible={isDatePickerOpen}
        initialDate={customDate}
        onConfirm={(iso, formatted) => {
          setCustomDate(formatted);
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
  resetHeaderText: {
    ...typography.caption,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: 40,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading4,
    fontSize: 16,
    color: colors.onSurface,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
    ...elevation.small,
  },
  chipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: colors.textLight,
    fontWeight: '600',
  },
  amountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountRangeDisplay: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  amountInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 4,
  },
  amountInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  currencyPrefix: {
    ...typography.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginRight: 6,
  },
  amountInputField: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
  },
  dashText: {
    fontSize: 16,
    color: colors.outlineVariant,
  },
  radioList: {
    gap: spacing.xs,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  radioLabel: {
    ...typography.body,
    fontSize: 15,
    color: colors.onSurface,
  },
  radioLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.primaryContainer,
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.small,
  },
  applyText: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.textLight,
  },
});
