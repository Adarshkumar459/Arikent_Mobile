import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../../screens/HomeScreen';
import { DashboardLoadingScreen } from '../../screens/home/DashboardLoadingScreen';
import { DashboardEmptyScreen } from '../../screens/home/DashboardEmptyScreen';
import { DashboardErrorScreen } from '../../screens/home/DashboardErrorScreen';
import { ProfileScreen } from '../../screens/profile/ProfileScreen';
import { PersonalInformationScreen } from '../../screens/profile/PersonalInformationScreen';
import { ChangePasswordScreen } from '../../screens/profile/ChangePasswordScreen';
import { NotificationSettingsScreen } from '../../screens/profile/NotificationSettingsScreen';
import { PreferencesScreen } from '../../screens/profile/PreferencesScreen';
import { SecuritySettingsScreen } from '../../screens/profile/SecuritySettingsScreen';
import { AboutScreen } from '../../screens/profile/AboutScreen';
import { DeleteAccountScreen } from '../../screens/profile/DeleteAccountScreen';
import { TaskListScreen } from '../../screens/tasks/TaskListScreen';
import { TaskDetailsScreen } from '../../screens/tasks/TaskDetailsScreen';
import { GoalsScreen } from '../../screens/goals/GoalsScreen';
import { GoalDetailsScreen } from '../../screens/goals/GoalDetailsScreen';
import { ExpensesScreen } from '../../screens/expenses/ExpensesScreen';
import { ExpenseDetailsScreen } from '../../screens/expenses/ExpenseDetailsScreen';
import { CalendarScreen } from '../../screens/calendar/CalendarScreen';
import { RemindersScreen } from '../../screens/reminders/RemindersScreen';
import { ReminderDetailsScreen } from '../../screens/reminders/ReminderDetailsScreen';
import { SelectedDateScreen } from '../../screens/calendar/SelectedDateScreen';
import { NotesScreen } from '../../screens/notes/NotesScreen';
import { HabitsScreen } from '../../screens/habits/HabitsScreen';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator<any>();

export const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }}>
      <Stack.Screen name="Dashboard" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardLoading" component={DashboardLoadingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardEmpty" component={DashboardEmptyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardError" component={DashboardErrorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tasks" component={TaskListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Goals" component={GoalsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GoalDetails" component={GoalDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Reminders" component={RemindersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ReminderDetails" component={ReminderDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SelectedDate" component={SelectedDateScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notes" component={NotesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Habits" component={HabitsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
