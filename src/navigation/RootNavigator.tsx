import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { AppLockGate } from '../security/AppLockGate';
import { colors } from '../theme';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 1. Show Auth flow when not authenticated
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // 2. Authenticated: App Lock gate sits between auth and main content.
  //    When locked: AppLockGate renders AppLockScreen.
  //    When unlocked/disabled: AppLockGate renders MainNavigator.
  return (
    <AppLockGate>
      <MainNavigator />
    </AppLockGate>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
