import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'EditExpense'>;

export const EditExpenseScreen: React.FC<Props> = ({ route, navigation }) => {
  const { expenseId } = route.params;
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    ExpenseRepository.getExpenseById(expenseId).then((e) => {
      setAmountText(e.amount.toString());
      setNote(e.note || '');
      setIsLoading(false);
    });
  }, [expenseId]);

  const handleUpdate = async () => {
    const amt = parseFloat(amountText.trim());
    if (isNaN(amt) || amt <= 0) return;
    setIsSubmitting(true);
    try {
      await ExpenseRepository.updateExpense(expenseId, { amount: amt, note: note.trim() || undefined });
      navigation.goBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading message="Loading transaction..." />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Edit Transaction</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={amountText} onChangeText={setAmountText} />
        <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="Notes" />
        <Button variant="primary" label="Save Changes" isLoading={isSubmitting} onPress={handleUpdate} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  header: { ...typography.h2, color: colors.textPrimary },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary },
});
