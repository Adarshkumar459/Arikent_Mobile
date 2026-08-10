import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AchieveGoals'>;

export const AchieveGoalsScreen: React.FC<Props> = ({ navigation }) => {
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  const handleSkip = async () => {
    (navigation as any).navigate('Login');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationBox}>
          <View style={styles.bullseyeOuter}>
            <View style={styles.bullseyeMiddle}>
              <View style={styles.bullseyeInner} />
            </View>
            <View style={styles.arrowLine} />
          </View>

          <View style={styles.barChartRow}>
            <View style={[styles.bar, { height: 30 }]} />
            <View style={[styles.bar, { height: 45 }]} />
            <View style={[styles.bar, { height: 65, backgroundColor: '#22C55E' }]} />
          </View>

          <View style={styles.starBadge}>
            <Text style={styles.starEmoji}>⭐</Text>
          </View>
        </View>

        <Text style={styles.mainHeading}>Achieve Your Goals</Text>
        <Text style={styles.description}>
          Set goals, track progress and celebrate every milestone.
        </Text>

        <View style={styles.indicatorRow}>
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.activeDot} />
          <View style={styles.inactiveDot} />
        </View>

        <View style={styles.actions}>
          <Button
            variant="primary"
            label="Next →"
            onPress={() => navigation.navigate('TrackExpenses' as any)}
            style={styles.nextBtn}
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
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  skipBtn: {
    padding: spacing.xs,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
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
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  illustrationBox: {
    width: 260,
    height: 200,
    borderRadius: radius['2xl'],
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  bullseyeOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 40,
    top: 35,
  },
  bullseyeMiddle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 6,
    borderColor: '#818CF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bullseyeInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
  },
  arrowLine: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 40,
    height: 4,
    backgroundColor: '#22C55E',
    transform: [{ rotate: '-45deg' }],
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    position: 'absolute',
    right: 40,
    bottom: 35,
  },
  bar: {
    width: 16,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  starBadge: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  starEmoji: {
    fontSize: 18,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xl,
  },
  activeDot: {
    width: 24,
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
  nextBtn: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
});
