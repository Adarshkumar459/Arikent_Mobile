import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Logo } from '../../components/brand/Logo';
import { useAuth } from '../../context/AuthContext';

export interface WelcomeBackScreenProps {
  onRestored?: () => void;
}

export const WelcomeBackScreen: React.FC<WelcomeBackScreenProps> = ({ onRestored }) => {
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onRestored) {
        onRestored();
      }
    }, 2500); // Auto navigate to dashboard after 2.5s

    return () => clearTimeout(timer);
  }, [onRestored]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoWrapper}>
          <Logo size="md" />
        </View>

        <Text style={styles.title}>Welcome Back 👋</Text>
        <Text style={styles.userName}>{user?.name ? `${user.name}!` : 'Good to see you again!'}</Text>
        <Text style={styles.subtitle}>Getting everything ready for you...</Text>

        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Restoring session</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    ...elevation.medium,
  },
  logoWrapper: {
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.heading1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  userName: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loaderBox: {
    marginTop: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
