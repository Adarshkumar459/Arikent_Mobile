import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { CreateTaskScreen } from '../screens/tasks/CreateTaskScreen';
import { TaskDetailsScreen } from '../screens/tasks/TaskDetailsScreen';
import { EditTaskScreen } from '../screens/tasks/EditTaskScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { AccountSettingsScreen } from '../screens/profile/AccountSettingsScreen';
import { GoalsScreen } from '../screens/goals/GoalsScreen';
import { CreateGoalScreen } from '../screens/goals/CreateGoalScreen';
import { GoalDetailsScreen } from '../screens/goals/GoalDetailsScreen';
import { EditGoalScreen } from '../screens/goals/EditGoalScreen';
import { UpdateGoalProgressScreen } from '../screens/goals/UpdateGoalProgressScreen';

import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { CreateHabitScreen } from '../screens/habits/CreateHabitScreen';
import { HabitDetailsScreen } from '../screens/habits/HabitDetailsScreen';
import { EditHabitScreen } from '../screens/habits/EditHabitScreen';
import { HabitHistoryScreen } from '../screens/habits/HabitHistoryScreen';
import { HabitStatsScreen } from '../screens/habits/HabitStatsScreen';

import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { SelectedDateScreen } from '../screens/calendar/SelectedDateScreen';
import { CreateEventScreen } from '../screens/calendar/CreateEventScreen';
import { EventDetailsScreen } from '../screens/calendar/EventDetailsScreen';
import { EditEventScreen } from '../screens/calendar/EditEventScreen';

import { RemindersScreen } from '../screens/reminders/RemindersScreen';
import { CreateReminderScreen } from '../screens/reminders/CreateReminderScreen';
import { ReminderDetailsScreen } from '../screens/reminders/ReminderDetailsScreen';
import { EditReminderScreen } from '../screens/reminders/EditReminderScreen';

import { ExpensesScreen } from '../screens/expenses/ExpensesScreen';
import { CreateExpenseScreen } from '../screens/expenses/CreateExpenseScreen';
import { ExpenseDetailsScreen } from '../screens/expenses/ExpenseDetailsScreen';
import { EditExpenseScreen } from '../screens/expenses/EditExpenseScreen';
import { ExpenseAnalyticsScreen } from '../screens/expenses/ExpenseAnalyticsScreen';
import { FilterExpensesScreen } from '../screens/expenses/FilterExpensesScreen';

import { NotesScreen } from '../screens/notes/NotesScreen';
import { CreateNoteScreen } from '../screens/notes/CreateNoteScreen';
import { NoteDetailsScreen } from '../screens/notes/NoteDetailsScreen';
import { EditNoteScreen } from '../screens/notes/EditNoteScreen';
import { NoteSearchScreen } from '../screens/notes/NoteSearchScreen';
import { NoteCategoriesScreen } from '../screens/notes/NoteCategoriesScreen';

import { AuthNavigator } from './AuthNavigator';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { BRAND } from '../constants/brand';

const Stack = createNativeStackNavigator<MainStackParamList>();

const NavigationContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: 'Create Task' }} />
          <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ title: 'Task Details' }} />
          <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ title: 'Edit Task' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'User Profile' }} />
          <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ title: 'Account Settings' }} />
          <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: 'My Goals' }} />
          <Stack.Screen name="CreateGoal" component={CreateGoalScreen} options={{ title: 'Create Goal' }} />
          <Stack.Screen name="GoalDetails" component={GoalDetailsScreen} options={{ title: 'Goal Details' }} />
          <Stack.Screen name="EditGoal" component={EditGoalScreen} options={{ title: 'Edit Goal' }} />
          <Stack.Screen name="UpdateGoalProgress" component={UpdateGoalProgressScreen} options={{ title: 'Log Goal Progress' }} />

          <Stack.Screen name="Habits" component={HabitsScreen} options={{ title: 'Habits' }} />
          <Stack.Screen name="CreateHabit" component={CreateHabitScreen} options={{ title: 'Create Habit' }} />
          <Stack.Screen name="HabitDetails" component={HabitDetailsScreen} options={{ title: 'Habit Details' }} />
          <Stack.Screen name="EditHabit" component={EditHabitScreen} options={{ title: 'Edit Habit' }} />
          <Stack.Screen name="HabitHistory" component={HabitHistoryScreen} options={{ title: 'Habit History' }} />
          <Stack.Screen name="HabitStats" component={HabitStatsScreen} options={{ title: 'Habit Stats' }} />

          <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
          <Stack.Screen name="SelectedDate" component={SelectedDateScreen} options={{ title: 'Day View' }} />
          <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event' }} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
          <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event' }} />

          <Stack.Screen name="Reminders" component={RemindersScreen} options={{ title: 'Reminders' }} />
          <Stack.Screen name="CreateReminder" component={CreateReminderScreen} options={{ title: 'Create Reminder' }} />
          <Stack.Screen name="ReminderDetails" component={ReminderDetailsScreen} options={{ title: 'Reminder Details' }} />
          <Stack.Screen name="EditReminder" component={EditReminderScreen} options={{ title: 'Edit Reminder' }} />

          <Stack.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Expenses' }} />
          <Stack.Screen name="CreateExpense" component={CreateExpenseScreen} options={{ title: 'Add Transaction' }} />
          <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} options={{ title: 'Transaction Details' }} />
          <Stack.Screen name="EditExpense" component={EditExpenseScreen} options={{ title: 'Edit Transaction' }} />
          <Stack.Screen name="ExpenseAnalytics" component={ExpenseAnalyticsScreen} options={{ title: 'Expense Analytics' }} />
          <Stack.Screen name="FilterExpenses" component={FilterExpensesScreen} options={{ title: 'Filter Expenses' }} />

          <Stack.Screen name="Notes" component={NotesScreen} options={{ title: 'Notes' }} />
          <Stack.Screen name="CreateNote" component={CreateNoteScreen} options={{ title: 'Create Note' }} />
          <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} options={{ title: 'Note Details' }} />
          <Stack.Screen name="EditNote" component={EditNoteScreen} options={{ title: 'Edit Note' }} />
          <Stack.Screen name="NoteSearch" component={NoteSearchScreen} options={{ title: 'Search Notes' }} />
          <Stack.Screen name="NoteCategories" component={NoteCategoriesScreen} options={{ title: 'Note Categories' }} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
