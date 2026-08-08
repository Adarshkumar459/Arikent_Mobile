import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { DangerButton } from '../../components/buttons';
import { StatusChip } from '../../components/chips/StatusChip';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

const MENU_ITEMS = [
  { label: 'Personal Information', icon: '👤', route: 'PersonalInformation' as const },
  { label: 'Change Password', icon: '🔒', route: 'ChangePassword' as const },
  { label: 'Notification Settings', icon: '🔔', route: 'NotificationSettings' as const },
  { label: 'App Preferences', icon: '⚙️', route: 'Preferences' as const },
  { label: 'Security & Privacy', icon: '🛡️', route: 'SecuritySettings' as const },
  { label: 'About ARKIENT', icon: 'ℹ️', route: 'About' as const },
  { label: 'Delete Account', icon: '🗑️', route: 'DeleteAccount' as const, isDanger: true },
];

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of ARKIENT?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Profile & Settings" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'ARKIENT User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@arkient.app'}</Text>
            <View style={styles.badgeRow}>
              <StatusChip status="completed" label={user?.isVerified ? 'Verified Account' : 'Active Account'} />
            </View>
          </View>
        </View>

        {/* Navigation Menu Card */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.route}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, item.isDanger && styles.dangerLabel]}>
                  {item.label}
                </Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Log Out CTA */}
        <View style={styles.logoutWrapper}>
          <DangerButton title="Log Out" onPress={handleLogout} />
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
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...elevation.small,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    ...typography.heading3,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  badgeRow: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...elevation.small,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dangerLabel: {
    color: colors.error,
  },
  menuArrow: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  logoutWrapper: {
    marginTop: spacing.xs,
  },
});
