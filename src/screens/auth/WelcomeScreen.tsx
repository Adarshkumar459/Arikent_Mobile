import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { PrimaryButton } from '../../components/buttons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F1FF" />

      {/* Atmospheric Background Lighting */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

      <View style={styles.container}>
        {/* Top Spacer / Brand Tag */}
        <View style={styles.tagWrapper}>
          <Text style={styles.tagText}>✨ Welcome to Arkient</Text>
        </View>

        {/* Center Card */}
        <View style={styles.card}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>💎</Text>
          </View>
          <Text style={styles.brandTitle}>ARKIENT</Text>
          <Text style={styles.brandSubtitle}>
            Organize tasks, track expenses, achieve goals, and streamline your entire daily workflow.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <PrimaryButton
              title="Get Started →"
              onPress={() => navigation.navigate('Onboarding')}
              style={styles.getStartedBtn}
            />

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginBtnText}>I already have an account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Secure • Fast • Unified</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F1FF',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(108, 76, 232, 0.12)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(203, 190, 255, 0.18)',
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagWrapper: {
    backgroundColor: '#E6DEFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#532DCF',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4F5',
    ...elevation.medium,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6C4CE8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: {
    fontSize: 32,
  },
  brandTitle: {
    ...typography.display,
    fontSize: 32,
    fontWeight: '800',
    color: '#532DCF',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  brandSubtitle: {
    ...typography.bodyLarge,
    fontSize: 14,
    color: '#484555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  actionContainer: {
    width: '100%',
    gap: spacing.md,
  },
  getStartedBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#6C4CE8',
  },
  loginBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CABEFF',
    backgroundColor: '#F0EFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#532DCF',
  },
  footer: {
    marginBottom: spacing.sm,
  },
  footerText: {
    fontSize: 12,
    color: '#797586',
    fontWeight: '600',
  },
});
