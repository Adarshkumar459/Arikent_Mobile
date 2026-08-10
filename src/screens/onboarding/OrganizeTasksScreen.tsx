import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { OnboardingRepository } from '../../repositories/OnboardingRepository';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OrganizeTasks'>;

export const OrganizeTasksScreen: React.FC<Props> = ({ navigation }) => {
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  const handleSkip = async () => {
    await OnboardingRepository.setOnboardingCompleted(true);
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
          <View style={styles.clipboard}>
            <View style={styles.clipboardClip} />
            <View style={styles.checkLine}>
              <View style={styles.checkSquare}><Text style={styles.checkMark}>✓</Text></View>
              <View style={styles.lineBar} />
            </View>
            <View style={styles.checkLine}>
              <View style={styles.checkSquare}><Text style={styles.checkMark}>✓</Text></View>
              <View style={styles.lineBar} />
            </View>
            <View style={styles.checkLine}>
              <View style={styles.checkSquare}><Text style={styles.checkMark}>✓</Text></View>
              <View style={styles.lineBar} />
            </View>
          </View>

          <View style={styles.bellBadge}>
            <Text style={styles.badgeEmoji}>🔔</Text>
          </View>
          <View style={styles.clockBadge}>
            <Text style={styles.badgeEmoji}>🕒</Text>
          </View>
        </View>

        <Text style={styles.mainHeading}>Organize Your Tasks</Text>
        <Text style={styles.description}>
          Plan your day, set priorities and never miss important things again.
        </Text>

        <View style={styles.indicatorRow}>
          <View style={styles.inactiveDot} />
          <View style={styles.activeDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
        </View>

        <View style={styles.actions}>
          <Button
            variant="primary"
            label="Next →"
            onPress={() => navigation.navigate('AchieveGoals' as any)}
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
  clipboard: {
    width: 120,
    height: 150,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
  },
  clipboardClip: {
    width: 40,
    height: 14,
    backgroundColor: colors.primary,
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: -20,
  },
  checkLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  lineBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.softPurple,
    borderRadius: 4,
  },
  bellBadge: {
    position: 'absolute',
    top: 25,
    right: 25,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  clockBadge: {
    position: 'absolute',
    bottom: 25,
    left: 25,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  badgeEmoji: {
    fontSize: 20,
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
