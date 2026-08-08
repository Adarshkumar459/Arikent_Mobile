import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { PrimaryButton } from '../../components/buttons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AchieveGoals'>;

export const AchieveGoalsScreen: React.FC<Props> = ({ navigation }) => {
  const handleSkip = () => {
    navigation.navigate('ReadyToStart');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationBox}>
          <View style={styles.targetRing}>
            <View style={styles.targetInner} />
          </View>
          <View style={styles.avatarHead} />
          <View style={styles.avatarBody} />
        </View>

        <Text style={styles.title}>Achieve Goals</Text>
        <Text style={styles.subtitle}>Set goals and track your progress.</Text>

        <View style={styles.indicatorRow}>
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.activeDot} />
          <View style={styles.inactiveDot} />
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Next" onPress={() => navigation.navigate('ReadyToStart')} />
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
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skipBtn: {
    padding: spacing.xs,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
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
    backgroundColor: colors.secondary,
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
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xl,
  },
  activeDot: {
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  actions: {
    width: '100%',
  },
});
