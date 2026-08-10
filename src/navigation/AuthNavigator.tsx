import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types/navigation.types';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { OrganizeTasksScreen } from '../screens/onboarding/OrganizeTasksScreen';
import { TrackExpensesScreen } from '../screens/onboarding/TrackExpensesScreen';
import { AchieveGoalsScreen } from '../screens/onboarding/AchieveGoalsScreen';
import { ReadyToStartScreen } from '../screens/onboarding/ReadyToStartScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerifyOTPScreen } from '../screens/auth/VerifyOTPScreen';
import { CreateNewPasswordScreen } from '../screens/auth/CreateNewPasswordScreen';
import { PasswordUpdatedScreen } from '../screens/auth/PasswordUpdatedScreen';
import { colors } from '../theme';

const AuthStack = createNativeStackNavigator<any>();

export const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="OrganizeTasks" component={OrganizeTasksScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="TrackExpenses" component={TrackExpensesScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="AchieveGoals" component={AchieveGoalsScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="ReadyToStart" component={ReadyToStartScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register Account' }} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
      <AuthStack.Screen name="VerifyOTP" component={VerifyOTPScreen} options={{ title: 'Verify OTP' }} />
      <AuthStack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} options={{ title: 'Create New Password' }} />
      <AuthStack.Screen name="PasswordUpdated" component={PasswordUpdatedScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
  );
};
