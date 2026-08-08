import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { EmptyState } from '../../components/states/EmptyState';

export const ExpenseEmptyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Expenses" />
      <View style={styles.content}>
        <EmptyState
          title="No Expenses Found"
          description="You haven't logged any transactions yet for this period."
          actionLabel="Add First Expense"
          onAction={() => navigation.navigate('AddExpense')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
});
