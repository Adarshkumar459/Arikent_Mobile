import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { OnboardingRepository } from '../../repositories/OnboardingRepository';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ReadyToStart'>;

export const ReadyToStartScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  const handleContinue = async () => {
    await OnboardingRepository.setOnboardingCompleted(true);
    if (isAuthenticated) {
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    } else {
      (navigation as any).navigate('Login');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
      <View style={styles.content}>
        <Text style={styles.mainHeading}>Welcome Back 👋</Text>
        <Text style={styles.description}>Good to see you again!</Text>

        <View style={styles.illustrationBox}>
          <View style={styles.avatarHead} />
          <View style={styles.avatarBody} />
          <View style={styles.wavingHand}>
            <Text style={styles.handEmoji}>👋</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureRow}>
            <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
              <Text style={styles.iconEmoji}>✓</Text>
            </View>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Stay productive</Text>
              <Text style={styles.featureSub}>Keep your tasks on track</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
              <Text style={styles.iconEmoji}>🔥</Text>
            </View>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Build good habits</Text>
              <Text style={styles.featureSub}>Consistency leads to growth</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.iconEmoji}>📝</Text>
            </View>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Capture your ideas</Text>
              <Text style={styles.featureSub}>Notes that stay with you</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            variant="primary"
            label="Continue to Dashboard →"
            onPress={handleContinue}
            style={styles.continueBtn}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  mainHeading: {
    ...typography.heading1,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  illustrationBox: {
    width: 260,
    height: 160,
    borderRadius: radius['2xl'],
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  avatarHead: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FBCFE8',
    borderWidth: 3,
    borderColor: '#1E293B',
    marginBottom: 2,
  },
  avatarBody: {
    width: 64,
    height: 50,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.primary,
  },
  wavingHand: {
    position: 'absolute',
    left: 45,
    top: 55,
  },
  handEmoji: {
    fontSize: 24,
  },
  featureCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.xl,
    ...elevation.small,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  featureTextWrapper: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  featureSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actions: {
    width: '100%',
  },
  continueBtn: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
});
