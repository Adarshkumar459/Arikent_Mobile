import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoalsStackParamList } from '../types/navigation.types';
import { GoalsScreen } from '../../screens/goals/GoalsScreen';
import { CreateGoalScreen } from '../../screens/goals/CreateGoalScreen';
import { EditGoalScreen } from '../../screens/goals/EditGoalScreen';
import { GoalDetailsScreen } from '../../screens/goals/GoalDetailsScreen';
import { UpdateGoalProgressScreen } from '../../screens/goals/UpdateGoalProgressScreen';
import { GoalCompletedScreen } from '../../screens/goals/GoalCompletedScreen';
import { GoalEmptyScreen } from '../../screens/goals/GoalEmptyScreen';
import { GoalLoadingScreen } from '../../screens/goals/GoalLoadingScreen';
import { GoalErrorScreen } from '../../screens/goals/GoalErrorScreen';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator<GoalsStackParamList>();

export const GoalsStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }}>
      <Stack.Screen name="GoalList" component={GoalsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddGoal" component={CreateGoalScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditGoal" component={EditGoalScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GoalDetails" component={GoalDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UpdateGoalProgress" component={UpdateGoalProgressScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GoalCompleted" component={GoalCompletedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GoalEmpty" component={GoalEmptyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GoalLoading" component={GoalLoadingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GoalError" component={GoalErrorScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
