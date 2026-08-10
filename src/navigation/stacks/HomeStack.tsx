import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../../screens/HomeScreen';
import { DashboardLoadingScreen } from '../../screens/home/DashboardLoadingScreen';
import { DashboardEmptyScreen } from '../../screens/home/DashboardEmptyScreen';
import { DashboardErrorScreen } from '../../screens/home/DashboardErrorScreen';
import { TaskDetailsScreen } from '../../screens/tasks/TaskDetailsScreen';
import { AddTaskScreen } from '../../screens/tasks/AddTaskScreen';
import { EditTaskScreen } from '../../screens/tasks/EditTaskScreen';
import { GoalDetailsScreen } from '../../screens/goals/GoalDetailsScreen';
import { CreateGoalScreen } from '../../screens/goals/CreateGoalScreen';
import { EditGoalScreen } from '../../screens/goals/EditGoalScreen';
import { ExpenseDetailsScreen } from '../../screens/expenses/ExpenseDetailsScreen';
import { RemindersScreen } from '../../screens/reminders/RemindersScreen';
import { ReminderDetailsScreen } from '../../screens/reminders/ReminderDetailsScreen';
import { SelectedDateScreen } from '../../screens/calendar/SelectedDateScreen';
import { NotesScreen } from '../../screens/notes/NotesScreen';
import { HabitsScreen } from '../../screens/habits/HabitsScreen';
import { CreateHabitScreen } from '../../screens/habits/CreateHabitScreen';
import { EditHabitScreen } from '../../screens/habits/EditHabitScreen';
import { HabitDetailsScreen } from '../../screens/habits/HabitDetailsScreen';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator<any>();

export const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }}>
      <Stack.Screen name="Dashboard" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardLoading" component={DashboardLoadingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardEmpty" component={DashboardEmptyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardError" component={DashboardErrorScreen} options={{ headerShown: false }} />
      
      {/* Task Creation & Details */}
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="AddTask" component={AddTaskScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="CreateTask" component={AddTaskScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="EditTask" component={EditTaskScreen as React.FC<any>} options={{ headerShown: false }} />
      
      {/* Goal Creation & Details */}
      <Stack.Screen name="GoalDetails" component={GoalDetailsScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="CreateGoal" component={CreateGoalScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="AddGoal" component={CreateGoalScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="EditGoal" component={EditGoalScreen as React.FC<any>} options={{ headerShown: false }} />
      
      {/* Expense Details */}
      <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen as React.FC<any>} options={{ headerShown: false }} />
      
      {/* Calendar & Reminder Screens */}
      <Stack.Screen name="Reminders" component={RemindersScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="ReminderDetails" component={ReminderDetailsScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="SelectedDate" component={SelectedDateScreen as React.FC<any>} options={{ headerShown: false }} />
      
      {/* Other Module Screens */}
      <Stack.Screen name="Notes" component={NotesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Habits" component={HabitsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateHabit" component={CreateHabitScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditHabit" component={EditHabitScreen as React.FC<any>} options={{ headerShown: false }} />
      <Stack.Screen name="HabitDetails" component={HabitDetailsScreen as React.FC<any>} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
