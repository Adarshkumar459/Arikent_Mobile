import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../types/navigation.types';
import { ExpensesScreen } from '../../screens/expenses/ExpensesScreen';
import { AddExpenseScreen } from '../../screens/expenses/AddExpenseScreen';
import { EditExpenseScreen } from '../../screens/expenses/EditExpenseScreen';
import { ExpenseDetailsScreen } from '../../screens/expenses/ExpenseDetailsScreen';
import { ExpenseAnalyticsScreen } from '../../screens/expenses/ExpenseAnalyticsScreen';
import { ExpenseFilterScreen } from '../../screens/expenses/ExpenseFilterScreen';
import { ExpenseEmptyScreen } from '../../screens/expenses/ExpenseEmptyScreen';
import { ExpenseLoadingScreen } from '../../screens/expenses/ExpenseLoadingScreen';
import { ExpenseErrorScreen } from '../../screens/expenses/ExpenseErrorScreen';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator<ExpensesStackParamList>();

export const ExpensesStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }}>
      <Stack.Screen name="ExpenseList" component={ExpensesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditExpense" component={EditExpenseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExpenseAnalytics" component={ExpenseAnalyticsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExpenseFilter" component={ExpenseFilterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExpenseEmpty" component={ExpenseEmptyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExpenseLoading" component={ExpenseLoadingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExpenseError" component={ExpenseErrorScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
