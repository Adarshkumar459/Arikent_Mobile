import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types/navigation.types';
import { OnboardingSliderScreen } from '../screens/onboarding/OnboardingSliderScreen';
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
      <Stack.Screen name="OrganizeTasks" component={OnboardingSliderScreen} />
      <Stack.Screen name="StayOnTopTasks" component={OnboardingSliderScreen} />
      <Stack.Screen name="TrackExpenses" component={OnboardingSliderScreen} />
      <Stack.Screen name="AchieveGoals" component={OnboardingSliderScreen} />
      <Stack.Screen name="ReadyToStart" component={OnboardingSliderScreen} />
    </Stack.Navigator>
  );
};
