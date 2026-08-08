import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingRepository } from '../repositories/OnboardingRepository';
import { colors } from '../theme';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    OnboardingRepository.isOnboardingCompleted().then((completed) => {
      setIsOnboardingCompleted(completed);
    });
  }, [isAuthenticated]);

  if (isAuthLoading || isOnboardingCompleted === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  if (!isOnboardingCompleted) {
    return <OnboardingNavigator />;
  }

  return <MainNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
