import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { PrimaryButton } from '../../components/buttons';
import { CategoryChip, StatusChip } from '../../components/chips';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'ExpenseFilter'>;

export const ExpenseFilterScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');

  const handleReset = () => {
    setSelectedType('All');
    setSelectedCategory('All');
    setSelectedMethod('All');
  };

  const handleApply = () => {
    navigation.navigate('ExpenseList', {
      type: selectedType !== 'All' ? selectedType.toLowerCase() : undefined,
      category: selectedCategory !== 'All' ? selectedCategory.toLowerCase() : undefined,
      paymentMethod: selectedMethod !== 'All' ? selectedMethod.toLowerCase().replace(' ', '_') : undefined,
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Filter Expenses"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRANSACTION TYPE</Text>
          <View style={styles.chipRow}>
            {['All', 'Income', 'Expense'].map((t) => (
              <StatusChip
                key={t}
                status={t as any}
                selected={selectedType === t}
                onPress={() => setSelectedType(t)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CATEGORY</Text>
          <View style={styles.chipRow}>
            {['All', 'Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Education', 'Other'].map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
          <View style={styles.chipRow}>
            {['All', 'Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'].map((pm) => (
              <CategoryChip
                key={pm}
                label={pm}
                selected={selectedMethod === pm}
                onPress={() => setSelectedMethod(pm)}
              />
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Apply Filters" onPress={handleApply} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  resetText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actions: {
    marginTop: spacing.md,
  },
});
