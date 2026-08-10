import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'TrackExpenses'>;

export const TrackExpensesScreen: React.FC<Props> = ({ navigation }) => {
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
          <View style={styles.pieChart}>
            <View style={styles.pieSlice1} />
            <View style={styles.pieSlice2} />
          </View>

          <View style={styles.wallet}>
            <View style={styles.cashBill} />
            <View style={styles.walletStrap} />
          </View>

          <View style={styles.currencyBadge}>
            <Text style={styles.currencyText}>₹</Text>
          </View>
        </View>

        <Text style={styles.mainHeading}>Track Your Finances</Text>
        <Text style={styles.description}>
          Manage expenses, create budgets and build better money habits.
        </Text>

        <View style={styles.indicatorRow}>
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.activeDot} />
        </View>

        <View style={styles.actions}>
          <Button
            variant="primary"
            label="Next →"
            onPress={() => navigation.navigate('ReadyToStart' as any)}
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
  pieChart: {
    position: 'absolute',
    top: 25,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F59E0B',
    overflow: 'hidden',
    elevation: 3,
  },
  pieSlice1: {
    width: 30,
    height: 60,
    backgroundColor: colors.primary,
  },
  pieSlice2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    backgroundColor: '#22C55E',
  },
  wallet: {
    width: 120,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  cashBill: {
    width: 80,
    height: 40,
    borderRadius: radius.xs,
    backgroundColor: '#22C55E',
    marginTop: -35,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  walletStrap: {
    width: 24,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    position: 'absolute',
    right: 15,
  },
  currencyBadge: {
    position: 'absolute',
    bottom: 25,
    right: 35,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  currencyText: {
    color: colors.surface,
    fontWeight: '800',
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
