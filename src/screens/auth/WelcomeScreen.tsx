import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { BRAND } from '../../constants/brand';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.brandTitle}>{BRAND.appName}</Text>
        <Text style={styles.mainHeading}>Manage Everything.{'\n'}Live Better.</Text>
        <Text style={styles.description}>
          Your all-in-one companion for tasks, goals, habits, finances, notes and more.
        </Text>

        <View style={styles.illustrationBox}>
          <View style={[styles.floatingIcon, { top: 20, left: 20 }]}>
            <Text style={styles.iconEmoji}>✓</Text>
          </View>
          <View style={[styles.floatingIcon, { top: 20, right: 20 }]}>
            <Text style={styles.iconEmoji}>📊</Text>
          </View>
          <View style={[styles.floatingIcon, { bottom: 25, left: 15 }]}>
            <Text style={styles.iconEmoji}>🎯</Text>
          </View>
          <View style={[styles.floatingIcon, { bottom: 25, right: 15 }]}>
            <Text style={styles.iconEmoji}>📅</Text>
          </View>

          <View style={styles.avatarHead} />
          <View style={styles.avatarBody} />
          <View style={styles.laptop} />
        </View>

        <View style={styles.indicatorRow}>
          <View style={styles.activeDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
        </View>

        <View style={styles.actions}>
          <Button
            variant="primary"
            label="Next →"
            onPress={() => navigation.navigate('OrganizeTasks' as any)}
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
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
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
    paddingHorizontal: spacing.md,
  },
  illustrationBox: {
    width: 260,
    height: 180,
    borderRadius: radius['2xl'],
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  floatingIcon: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconEmoji: {
    fontSize: 16,
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
  laptop: {
    width: 80,
    height: 12,
    backgroundColor: '#94A3B8',
    borderRadius: 4,
    marginTop: -8,
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
