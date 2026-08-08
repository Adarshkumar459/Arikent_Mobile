import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { PrimaryButton } from '../../components/buttons';
import { OnboardingRepository } from '../../repositories/OnboardingRepository';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ReadyToStart'>;

export const ReadyToStartScreen: React.FC<Props> = ({ navigation }) => {
  const handleGetStarted = async () => {
    await OnboardingRepository.setOnboardingCompleted(true);
    // Navigating or triggering state change
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Main' as never }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.illustrationBox}>
          <View style={styles.targetRing}>
            <View style={styles.targetInner} />
          </View>
          <View style={styles.avatarHead} />
          <View style={styles.avatarBody} />
        </View>

        <Text style={styles.title}>Ready to Start?</Text>
        <Text style={styles.subtitle}>Let's organize your life.</Text>

        <View style={styles.actions}>
          <PrimaryButton title="Get Started" onPress={handleGetStarted} />
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
  illustrationBox: {
    width: 240,
    height: 180,
    borderRadius: radius.xl,
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  targetRing: {
    position: 'absolute',
    right: 40,
    top: 45,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 6,
    borderColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
  },
  avatarHead: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FBCFE8',
    borderWidth: 4,
    borderColor: '#1E293B',
    marginBottom: 4,
  },
  avatarBody: {
    width: 72,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.primary,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    width: '100%',
    marginTop: spacing.md,
  },
});
