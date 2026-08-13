import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types/navigation.types';
import { ProfileScreen } from '../../screens/profile/ProfileScreen';
import { PersonalInformationScreen } from '../../screens/profile/PersonalInformationScreen';
import { ChangePasswordScreen } from '../../screens/profile/ChangePasswordScreen';
import { NotificationSettingsScreen } from '../../screens/profile/NotificationSettingsScreen';
import { PreferencesScreen } from '../../screens/profile/PreferencesScreen';
import { SecuritySettingsScreen } from '../../screens/profile/SecuritySettingsScreen';
import { AboutScreen } from '../../screens/profile/AboutScreen';
import { DeleteAccountScreen } from '../../screens/profile/DeleteAccountScreen';
import { AppLockSettingsScreen } from '../../screens/profile/AppLockSettingsScreen';
import { PinSetupScreen } from '../../security/PinSetupScreen';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AppLockSettings" component={AppLockSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AppLockSetup" component={PinSetupScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
