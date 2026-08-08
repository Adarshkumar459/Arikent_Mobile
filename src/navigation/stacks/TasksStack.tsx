import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TasksStackParamList } from '../types/navigation.types';
import { TaskListScreen } from '../../screens/tasks/TaskListScreen';
import { AddTaskScreen } from '../../screens/tasks/AddTaskScreen';
import { EditTaskScreen } from '../../screens/tasks/EditTaskScreen';
import { TaskDetailsScreen } from '../../screens/tasks/TaskDetailsScreen';
import { TaskFilterScreen } from '../../screens/tasks/TaskFilterScreen';
import { TaskEmptyScreen } from '../../screens/tasks/TaskEmptyScreen';
import { TaskLoadingScreen } from '../../screens/tasks/TaskLoadingScreen';
import { TaskErrorScreen } from '../../screens/tasks/TaskErrorScreen';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator<TasksStackParamList>();

export const TasksStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }}>
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaskFilter" component={TaskFilterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaskEmpty" component={TaskEmptyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaskLoading" component={TaskLoadingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaskError" component={TaskErrorScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
