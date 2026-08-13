import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { SecondaryButton, DangerButton } from '../../components/buttons';
import { useAuth } from '../../context/AuthContext';
import { useAppLock } from '../../security/AppLockContext';
import { useCustomAlert } from '../../components/alerts/CustomAlert';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SecuritySettings'>;

export const SecuritySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const { settings, lockState } = useAppLock();
  const { showAlert, CustomAlertModal } = useCustomAlert();

  const isAppLockOn = settings.enabled && lockState !== 'DISABLED';

  const handleLogoutAll = () => {
    showAlert(
      'Log Out All Devices',
      'Are you sure you want to log out from all active sessions across all devices?',
      'warning',
      [
        { text: 'Cancel', variant: 'secondary' },
        {
          text: 'Log Out All',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Security & Privacy" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* App Lock Quick Settings Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP SECURITY</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                if (settings.pinConfigured) {
                  navigation.navigate('AppLockSettings');
                } else {
                  navigation.navigate('AppLockSetup', { mode: 'setup' });
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingLabel}>App Lock Security Gate</Text>
                <Text style={styles.settingSubtext}>
                  {isAppLockOn
                    ? 'App-level protection enabled'
                    : 'PIN protection disabled'}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  isAppLockOn ? styles.badgeOn : styles.badgeOff,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isAppLockOn ? styles.badgeTextOn : styles.badgeTextOff,
                  ]}
                >
                  {isAppLockOn ? 'ON' : 'OFF'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate('ChangePassword')}
              activeOpacity={0.7}
            >
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingLabel}>Change Password</Text>
                <Text style={styles.settingSubtext}>
                  Update your account password
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sessions & Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SESSIONS & ACCOUNT</Text>
          <View style={styles.card}>
            <DangerButton
              title="Log Out All Devices"
              onPress={handleLogoutAll}
              style={styles.dangerBtn}
            />
            <SecondaryButton
              title="Delete Account"
              onPress={() => navigation.navigate('DeleteAccount')}
              style={styles.secBtn}
            />
          </View>
        </View>
      </ScrollView>
      <CustomAlertModal />
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
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...elevation.small,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  settingTextGroup: {
    flex: 1,
  },
  settingLabel: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  settingSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.outline,
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.full,
    marginRight: spacing.xs,
  },
  badgeOn: {
    backgroundColor: colors.primaryLight,
  },
  badgeOff: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  badgeTextOn: {
    color: colors.primary,
  },
  badgeTextOff: {
    color: colors.textSecondary,
  },
  dangerBtn: {
    marginBottom: spacing.xs,
  },
  secBtn: {
    borderColor: colors.error,
  },
});
