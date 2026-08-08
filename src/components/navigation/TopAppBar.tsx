import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';

export interface TopAppBarProps {
  greeting?: string;
  userName?: string;
  avatarText?: string;
  userAvatar?: string | null;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  onNotificationClick?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  greeting = 'Good Morning',
  userName = 'User',
  avatarText = 'AR',
  userAvatar,
  onAvatarPress,
  onNotificationPress,
  onNotificationClick,
}) => {
  const insets = useSafeAreaInsets();
  const handleNotif = onNotificationPress || onNotificationClick;
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0);

  return (
    <View style={[styles.container, { paddingTop: topInset + spacing.xs }]}>
      <TouchableOpacity style={styles.left} onPress={onAvatarPress} activeOpacity={0.8}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarText}</Text>
        </View>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
      </TouchableOpacity>

      {handleNotif ? (
        <TouchableOpacity style={styles.bellBtn} onPress={handleNotif}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { ...typography.heading3, color: colors.surface, fontWeight: '700' },
  greeting: { ...typography.caption, color: colors.textSecondary },
  userName: { ...typography.heading3, color: colors.textPrimary },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: { fontSize: 18 },
});
