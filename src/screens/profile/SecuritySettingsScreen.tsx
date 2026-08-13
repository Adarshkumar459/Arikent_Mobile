import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { SecondaryButton, DangerButton } from '../../components/buttons';
import { useAuth } from '../../context/AuthContext';
import { useAppLock } from '../../security/AppLockContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SecuritySettings'>;

export const SecuritySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const { settings, lockState } = useAppLock();

  const isAppLockOn = settings.enabled && lockState !== 'DISABLED';

  const handleLogoutAll = () => {
    Alert.alert(
      'Log Out All Devices',
      'Are you sure you want to log out from all active sessions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out All',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Security & Privacy" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── APP LOCK LINK CARD ─────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('AppLockSettings')}
          activeOpacity={0.8}
        >
          <View style={styles.rowBetween}>
            <View style={styles.rowLabelGroup}>
              <Text style={styles.cardTitle}>APP LOCK</Text>
              <Text style={styles.cardSubtitle}>
                {isAppLockOn ? '🔒 App Lock is active' : '🔓 App Lock is disabled'}
              </Text>
            </View>
            <View style={[styles.badge, isAppLockOn ? styles.badgeOn : styles.badgeOff]}>
              <Text style={[styles.badgeText, isAppLockOn ? styles.badgeTextOn : styles.badgeTextOff]}>
                {isAppLockOn ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── PASSWORD SECURITY CARD ─────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PASSWORD SECURITY</Text>
          <Text style={styles.cardSubtitle}>
            Update your account password to maintain security across your devices.
          </Text>
          <SecondaryButton
            title="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>

        {/* ── ACTIVE SESSION CARD ─────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ACTIVE SESSION</Text>
          <Text style={styles.cardSubtitle}>
            Current Device: Mobile Application Client (Authenticated)
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>● Session Active & Encrypted</Text>
          </View>
        </View>

        <View style={styles.actionWrapper}>
          <DangerButton title="Log Out All Devices" onPress={handleLogoutAll} />
        </View>
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
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    ...elevation.small,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabelGroup: {
    flex: 1,
  },
  cardTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeOn: {
    backgroundColor: colors.primaryLight,
  },
  badgeOff: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextOn: {
    color: colors.primary,
  },
  badgeTextOff: {
    color: colors.outline,
  },
  statusBadge: {
    backgroundColor: colors.successBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  actionWrapper: {
    marginTop: spacing.md,
  },
});
