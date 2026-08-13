import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTabNav } from '../../context/TabContext';
import { useAppLock } from '../../security/AppLockContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

type ProfileNoParamRoute = {
  [K in keyof ProfileStackParamList]: ProfileStackParamList[K] extends undefined ? K : never;
}[keyof ProfileStackParamList];

interface MenuItem {
  label: string;
  icon: string;
  route: ProfileNoParamRoute;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
}

const ACCOUNT_MENU: MenuItem[] = [
  { label: 'Personal Information', icon: '👤', route: 'PersonalInformation' },
  { label: 'Change Password', icon: '🔑', route: 'ChangePassword' },
];

const PREF_MENU: MenuItem[] = [
  { label: 'App Preferences', icon: '🎨', route: 'Preferences' },
  { label: 'Notification Settings', icon: '🔔', route: 'NotificationSettings' },
  { label: 'About ARKIENT', icon: 'ℹ️', route: 'About' },
];

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { switchTab } = useTabNav();
  const { settings, lockState } = useAppLock();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  const isAppLockOn = settings.enabled && lockState !== 'DISABLED';

  const handleAppLockPress = () => {
    if (settings.pinConfigured) {
      navigation.navigate('AppLockSettings');
    } else {
      // First-time setup (#3): open 6-digit PIN setup screen directly
      navigation.navigate('AppLockSetup', { mode: 'setup' });
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of ARKIENT?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => { await logout(); },
      },
    ]);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map((p) => p[0]).join('').toUpperCase().substring(0, 2);
  };

  const renderMenuGroup = (title: string, items: MenuItem[]) => (
    <View style={styles.menuGroup}>
      <Text style={styles.groupHeader}>{title}</Text>
      <View style={styles.menuCard}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const onPressAction = item.onPress || (() => navigation.navigate(item.route));

          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, !isLast && styles.menuRowBorder]}
              onPress={onPressAction}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconCircle}>
                <Text style={styles.menuIconEmoji}>{item.icon}</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
              </View>
              {item.badge && (
                <View style={[styles.badge, item.badge === 'ON' ? styles.badgeOn : styles.badgeOff]}>
                  <Text style={[styles.badgeText, item.badge === 'ON' ? styles.badgeTextOn : styles.badgeTextOff]}>
                    {item.badge}
                  </Text>
                </View>
              )}
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const securityMenu: MenuItem[] = [
    {
      label: 'App Lock',
      icon: '🔐',
      route: 'AppLockSettings',
      subtitle: isAppLockOn ? 'Protect ARKIENT with PIN/biometric' : 'PIN protection disabled',
      badge: isAppLockOn ? 'ON' : 'OFF',
      onPress: handleAppLockPress,
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeftRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => switchTab('Home')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => switchTab('Home')} activeOpacity={0.8}>
            <Text style={styles.topBarBrand}>ARKIENT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.topBarAvatar}>
          <Text style={styles.topBarAvatarText}>{getInitials(user?.name)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{getInitials(user?.name)}</Text>
            </View>
            <TouchableOpacity
              style={styles.editBadge}
              onPress={() => navigation.navigate('PersonalInformation')}
            >
              <Text style={styles.editBadgeText}>✏️</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'ARKIENT User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@arkient.app'}</Text>

          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>
              {user?.isVerified ? '✅  Verified Account' : '✔  Active Account'}
            </Text>
          </View>
        </View>

        {/* Account group */}
        {renderMenuGroup('ACCOUNT', ACCOUNT_MENU)}

        {/* Security group (#1, #14) */}
        {renderMenuGroup('SECURITY', securityMenu)}

        {/* Preferences group */}
        {renderMenuGroup('PREFERENCES', PREF_MENU)}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
          <Text style={styles.logoutText}>↪  Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBarLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backBtn: {
    paddingRight: 4,
  },
  backBtnText: {
    fontSize: 26,
    color: colors.primary,
    fontWeight: '600',
    marginTop: -2,
  },
  topBarBrand: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  topBarAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarAvatarText: {
    color: colors.onPrimaryContainer,
    fontWeight: '700',
    fontSize: 12,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['5xl'],
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surfaceContainerLowest,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.onPrimaryContainer,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  editBadgeText: { fontSize: 12 },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 13,
    color: colors.outline,
    marginBottom: spacing.md,
  },
  proBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  menuGroup: {
    marginBottom: spacing.md,
  },
  groupHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.outline,
    letterSpacing: 0.8,
    marginBottom: spacing.xs + 2,
    paddingLeft: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIconEmoji: { fontSize: 17 },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.outline,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
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
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextOn: {
    color: colors.primary,
  },
  badgeTextOff: {
    color: colors.outline,
  },
  menuChevron: {
    fontSize: 22,
    color: colors.outline,
    marginTop: -2,
  },
  logoutBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: `${colors.errorContainer}50`,
    borderRadius: radius.xl,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.error,
  },
});
