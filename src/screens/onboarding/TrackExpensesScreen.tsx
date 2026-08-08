import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { PrimaryButton } from '../../components/buttons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'TrackExpenses'>;

export const TrackExpensesScreen: React.FC<Props> = ({ navigation }) => {
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
          <View style={styles.cardBox1} />
          <View style={styles.cardBox2} />
          <View style={styles.avatarHead} />
          <View style={styles.avatarBody} />
        </View>

        <Text style={styles.title}>Track Expenses</Text>
        <Text style={styles.subtitle}>Know where your money goes.</Text>

        <View style={styles.indicatorRow}>
          <View style={styles.inactiveDot} />
          <View style={styles.activeDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Next" onPress={() => navigation.navigate('AchieveGoals')} />
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
  cardBox1: {
    position: 'absolute',
    left: 45,
    top: 60,
    width: 44,
    height: 28,
    borderRadius: radius.xs,
    backgroundColor: '#22C55E',
  },
  cardBox2: {
    position: 'absolute',
    left: 55,
    top: 50,
    width: 44,
    height: 28,
    borderRadius: radius.xs,
    backgroundColor: '#EAB308',
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
    backgroundColor: '#3B82F6',
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
