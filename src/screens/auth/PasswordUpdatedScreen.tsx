import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { PrimaryButton } from '../../components/buttons';

type Props = NativeStackScreenProps<AuthStackParamList, 'PasswordUpdated'>;

export const PasswordUpdatedScreen: React.FC<Props> = ({ navigation }) => {
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
      <View style={styles.content}>
        <View style={styles.shieldWrapper}>
          <View style={styles.confetti1} />
          <View style={styles.confetti2} />
          <View style={styles.confetti3} />

          <View style={styles.shieldBox}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        </View>

        <Text style={styles.title}>Password Reset Successful!</Text>
        <Text style={styles.subtitle}>You can now log in with your new password.</Text>

        <View style={styles.actions}>
          <PrimaryButton title="Go to Log In" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  shieldWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  confetti1: {
    position: 'absolute',
    top: 10,
    left: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
  },
  confetti2: {
    position: 'absolute',
    top: 20,
    right: 10,
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  confetti3: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  shieldBox: {
    width: 90,
    height: 90,
    borderRadius: radius['2xl'],
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  checkIcon: {
    fontSize: 44,
    color: colors.surface,
    fontWeight: '800',
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.md,
  },
  actions: {
    width: '100%',
  },
});
