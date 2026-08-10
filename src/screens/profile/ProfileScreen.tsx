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

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

interface MenuItem {
  label: string;
  icon: string;
  route: keyof ProfileStackParamList;
}

const ACCOUNT_MENU: MenuItem[] = [
  { label: 'Personal Information', icon: '👤', route: 'PersonalInformation' },
  { label: 'Change Password', icon: '🔒', route: 'ChangePassword' },
  { label: 'Notification Settings', icon: '🔔', route: 'NotificationSettings' },
];

const PREF_MENU: MenuItem[] = [
  { label: 'App Preferences', icon: '🎨', route: 'Preferences' },
  { label: 'Security & Privacy', icon: '🛡️', route: 'SecuritySettings' },
  { label: 'About ARKIENT', icon: 'ℹ️', route: 'About' },
];

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { switchTab } = useTabNav();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

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

  const renderMenuGroup = (items: MenuItem[]) => (
    <View style={styles.menuCard}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <TouchableOpacity
            key={item.route}
            style={[styles.menuRow, !isLast && styles.menuRowBorder]}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconCircle}>
              <Text style={styles.menuIconEmoji}>{item.icon}</Text>
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
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
        {renderMenuGroup(ACCOUNT_MENU)}

        {/* Prefs group */}
        {renderMenuGroup(PREF_MENU)}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
          <Text style={styles.logoutText}>↪  Logout</Text>
        </TouchableOpacity>

        {/* Bottom spacer for bottom nav */}
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
  // Avatar section
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
  // Menu cards
  menuCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
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
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: '400',
  },
  menuChevron: {
    fontSize: 22,
    color: colors.outline,
    marginTop: -2,
  },
  // Logout
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
