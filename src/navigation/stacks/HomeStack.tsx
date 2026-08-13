import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types/navigation.types';
import { HomeScreen } from '../../screens/HomeScreen';
import { DashboardLoadingScreen } from '../../screens/home/DashboardLoadingScreen';
import { DashboardEmptyScreen } from '../../screens/home/DashboardEmptyScreen';
import { DashboardErrorScreen } from '../../screens/home/DashboardErrorScreen';
import { RemindersScreen } from '../../screens/reminders/RemindersScreen';
import { ReminderDetailsScreen } from '../../screens/reminders/ReminderDetailsScreen';
import { SelectedDateScreen } from '../../screens/calendar/SelectedDateScreen';
import { NotesScreen } from '../../screens/notes/NotesScreen';
import { HabitsScreen } from '../../screens/habits/HabitsScreen';
import { CreateHabitScreen } from '../../screens/habits/CreateHabitScreen';
import { EditHabitScreen } from '../../screens/habits/EditHabitScreen';
import { HabitDetailsScreen } from '../../screens/habits/HabitDetailsScreen';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }}>
      <Stack.Screen name="Dashboard" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardLoading" component={DashboardLoadingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardEmpty" component={DashboardEmptyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardError" component={DashboardErrorScreen} options={{ headerShown: false }} />
      
      {/* Utility Screens */}
      <Stack.Screen name="Reminders" component={RemindersScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="ReminderDetails" component={ReminderDetailsScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="SelectedDate" component={SelectedDateScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="Notes" component={NotesScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="Habits" component={HabitsScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="CreateHabit" component={CreateHabitScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="EditHabit" component={EditHabitScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="HabitDetails" component={HabitDetailsScreen as React.FC<any>} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
