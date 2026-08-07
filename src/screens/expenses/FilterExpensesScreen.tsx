import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { ExpenseType, ExpenseCategory } from '../../services/api/expenseApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';

type Props = NativeStackScreenProps<MainStackParamList, 'FilterExpenses'>;

export const FilterExpensesScreen: React.FC<Props> = ({ navigation }) => {
  const [type, setType] = useState<ExpenseType | undefined>(undefined);
  const [category, setCategory] = useState<ExpenseCategory | undefined>(undefined);

  const handleApply = () => {
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Filter Expenses</Text>
      <Text style={styles.label}>Type</Text>
      <View style={styles.row}>
        {(['income', 'expense'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}>
            <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button variant="primary" label="Apply Filters" onPress={handleApply} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2, color: colors.textPrimary },
  label: { ...typography.label, color: colors.textPrimary },
  row: { flexDirection: 'row', gap: spacing.sm },
  chip: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: '#FFF' },
});
