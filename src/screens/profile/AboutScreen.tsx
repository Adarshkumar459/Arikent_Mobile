import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { Logo } from '../../components/brand/Logo';

type Props = NativeStackScreenProps<ProfileStackParamList, 'About'>;

export const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const version = '0.1.0';

  const handleLink = (title: string) => {
    Alert.alert(title, `Opening ${title}...`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="About ARKIENT" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Logo size="large" />
          <Text style={styles.appName}>ARKIENT</Text>
          <Text style={styles.tagline}>Manage Everything. Live Better.</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v{version}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.desc}>
            ARKIENT is your unified life management suite, bringing together tasks, expenses, goals, habits, and calendar schedules into a single elegant mobile experience.
          </Text>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={() => handleLink('Terms of Service')}>
            <Text style={styles.linkLabel}>Terms of Service</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={() => handleLink('Privacy Policy')}>
            <Text style={styles.linkLabel}>Privacy Policy</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={() => handleLink('Open Source Licenses')}>
            <Text style={styles.linkLabel}>Open Source Licenses</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>© 2026 ARKIENT Inc. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
    ...elevation.small,
  },
  appName: {
    ...typography.display,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  tagline: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  versionBadge: {
    backgroundColor: colors.softPurple,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  versionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    ...elevation.small,
  },
  desc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  linkArrow: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  footerText: {
    ...typography.caption,
    color: colors.textDisabled,
    marginTop: spacing.md,
  },
});
