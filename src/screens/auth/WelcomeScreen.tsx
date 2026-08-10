import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { PrimaryButton, SecondaryButton } from '../../components/buttons';
import { BRAND } from '../../constants/brand';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Ambient background lighting */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* 3D Elevated Brand Card */}
        <View style={styles.illustrationBox}>
          <View style={styles.brandCard}>
            <View style={styles.logoBadgeContainer}>
              <Image
                source={require('../../../assets/arkient-logo.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>

            <View style={styles.pillRow}>
              <View style={styles.featurePill}>
                <Text style={styles.pillEmoji}>📋</Text>
                <Text style={styles.pillText}>Tasks</Text>
              </View>
              <View style={styles.featurePill}>
                <Text style={styles.pillEmoji}>💰</Text>
                <Text style={styles.pillText}>Expenses</Text>
              </View>
              <View style={styles.featurePill}>
                <Text style={styles.pillEmoji}>🎯</Text>
                <Text style={styles.pillText}>Goals</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Title & Subtitle */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Welcome to {BRAND.appName}</Text>
          <Text style={styles.subtitle}>
            Organize your everyday life in one simple place.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <PrimaryButton
            title="Get Started"
            onPress={() => navigation.navigate('Onboarding')}
            style={styles.getStartedBtn}
          />
          <SecondaryButton
            title="Login"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginBtn}
          />
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
  ambientGlowTop: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(108, 76, 232, 0.08)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(96, 62, 212, 0.06)',
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? spacing.md : spacing.xs,
  },
  skipBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: 'rgba(228, 226, 228, 0.4)',
  },
  skipText: {
    ...typography.caption,
    fontWeight: '600',
    color: '#484555',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  illustrationBox: {
    width: '100%',
    maxHeight: 320,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  brandCard: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E2E4',
    ...elevation.medium,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.12,
  },
  logoBadgeContainer: {
    width: 90,
    height: 90,
    borderRadius: radius.xl,
    backgroundColor: '#F0EFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  logoImg: {
    width: 60,
    height: 60,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: '#FCF8FB',
    borderWidth: 1,
    borderColor: '#E4E2E4',
  },
  pillEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1B1B1D',
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  title: {
    ...typography.heading1,
    fontSize: 26,
    color: '#1B1B1D',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyLarge,
    fontSize: 15,
    color: '#484555',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 290,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  getStartedBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  loginBtn: {
    height: 52,
    borderRadius: 14,
  },
});
