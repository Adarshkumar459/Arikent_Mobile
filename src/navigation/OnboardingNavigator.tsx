import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { OrganizeTasksScreen } from '../screens/onboarding/OrganizeTasksScreen';
import { AchieveGoalsScreen } from '../screens/onboarding/AchieveGoalsScreen';
import { TrackExpensesScreen } from '../screens/onboarding/TrackExpensesScreen';
import { ReadyToStartScreen } from '../screens/onboarding/ReadyToStartScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<any>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="OrganizeTasks" component={OrganizeTasksScreen} />
      <Stack.Screen name="AchieveGoals" component={AchieveGoalsScreen} />
      <Stack.Screen name="TrackExpenses" component={TrackExpensesScreen} />
      <Stack.Screen name="ReadyToStart" component={ReadyToStartScreen} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register Account' }} />
    </Stack.Navigator>
  );
};
