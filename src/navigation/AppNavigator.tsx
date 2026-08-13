import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '../context/AuthContext';
import { AppLockProvider } from '../security/AppLockContext';
import { RootNavigator } from './RootNavigator';

export const AppNavigator: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        {/* AppLockProvider is inside AuthProvider so it can read useAuth() */}
        <AppLockProvider>
          <RootNavigator />
        </AppLockProvider>
      </NavigationContainer>
    </AuthProvider>
  );
};
