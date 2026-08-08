import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types/navigation.types';
import { OrganizeTasksScreen } from '../screens/onboarding/OrganizeTasksScreen';
import { TrackExpensesScreen } from '../screens/onboarding/TrackExpensesScreen';
import { AchieveGoalsScreen } from '../screens/onboarding/AchieveGoalsScreen';
import { ReadyToStartScreen } from '../screens/onboarding/ReadyToStartScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="OrganizeTasks"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="OrganizeTasks" component={OrganizeTasksScreen} />
      <Stack.Screen name="TrackExpenses" component={TrackExpensesScreen} />
      <Stack.Screen name="AchieveGoals" component={AchieveGoalsScreen} />
      <Stack.Screen name="ReadyToStart" component={ReadyToStartScreen} />
    </Stack.Navigator>
  );
};
