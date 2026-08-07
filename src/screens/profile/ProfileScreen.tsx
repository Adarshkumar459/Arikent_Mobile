import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/buttons/Button';
import { MainStackParamList } from '../../navigation/types';
import { colors, spacing, typography, radius, elevation } from '../../theme';

type ProfileScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Profile'>;

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout, updateProfile, deleteAccount } = useAuth();

  const [name, setName] = useState<string>(user?.name || '');
  const [avatar, setAvatar] = useState<string>(user?.avatar || '');
  const [editing, setEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getInitials = (fullName?: string): string => {
    if (!fullName) return 'A';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setMessage(null);
    try {
      await updateProfile({ name: name.trim(), avatar: avatar.trim() });
      setMessage('Profile updated successfully!');
      setEditing(false);
      setImageError(false);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAvatar = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await updateProfile({ avatar: '' });
      setAvatar('');
      setImageError(false);
      setMessage('Avatar removed successfully.');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to remove avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAccount() },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}
    >
      {/* Header Card with Avatar */}
      <View style={styles.headerCard}>
        <View style={styles.avatarWrapper}>
          {user?.avatar && !imageError ? (
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatarImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{getInitials(user?.name)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        <View style={styles.badgeGroup}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Verified Account</Text>
          </View>

          <View style={[styles.badge, styles.tzBadge]}>
            <Text style={styles.tzBadgeText}>
              🌐 {user?.timezone || 'Asia/Kolkata'}
            </Text>
          </View>
        </View>
      </View>

      {/* Profile Details & Edit Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile Details</Text>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {message ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{message}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Full Name</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            placeholderTextColor={colors.textSecondary}
          />
        ) : (
          <Text style={styles.valueText}>{user?.name}</Text>
        )}

        <Text style={styles.label}>Email Address</Text>
        <Text style={styles.valueText}>{user?.email}</Text>

        <Text style={styles.label}>Timezone</Text>
        <Text style={styles.valueText}>{user?.timezone || 'Asia/Kolkata'}</Text>

        {editing ? (
          <>
            <Text style={styles.label}>Avatar Image URL</Text>
            <TextInput
              style={styles.input}
              value={avatar}
              onChangeText={setAvatar}
              placeholder="https://example.com/avatar.jpg"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Or Pick Preset Avatar</Text>
            <View style={styles.presetGrid}>
              {PRESET_AVATARS.map((url, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setAvatar(url)}
                  activeOpacity={0.7}
                  style={[
                    styles.presetCircle,
                    avatar === url && styles.presetCircleActive,
                  ]}
                >
                  <Image source={{ uri: url }} style={styles.presetImage} />
                </TouchableOpacity>
              ))}
            </View>

            {user?.avatar ? (
              <TouchableOpacity
                onPress={handleClearAvatar}
                style={styles.removeAvatarButton}
              >
                <Text style={styles.removeAvatarText}>Remove Avatar</Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}

        <View style={styles.buttonGroup}>
          {editing ? (
            <>
              <Button
                variant="primary"
                label="Save Profile Changes"
                isLoading={loading}
                onPress={handleUpdateProfile}
                style={styles.actionButton}
              />
              <Button
                variant="ghost"
                label="Cancel"
                onPress={() => {
                  setName(user?.name || '');
                  setAvatar(user?.avatar || '');
                  setEditing(false);
                }}
                style={styles.actionButton}
              />
            </>
          ) : (
            <Button
              variant="outline"
              label="Edit Profile & Avatar"
              onPress={() => setEditing(true)}
              style={styles.actionButton}
            />
          )}

          <Button
            variant="primary"
            label="Account Settings"
            onPress={() => navigation.navigate('AccountSettings')}
            style={styles.actionButton}
          />

          <Button
            variant="secondary"
            label="Log Out"
            onPress={logout}
            style={styles.actionButton}
          />

          <Button
            variant="danger"
            label="Delete Account"
            onPress={handleDeleteAccount}
            style={styles.actionButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  headerCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...elevation.medium,
  },
  avatarWrapper: {
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    ...typography.h2,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  tzBadge: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tzBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    ...elevation.small,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  valueText: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  presetGrid: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  presetCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  presetCircleActive: {
    borderColor: colors.primary,
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  removeAvatarButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  removeAvatarText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  buttonGroup: {
    marginTop: spacing.xl,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
  },
  successBox: {
    backgroundColor: '#DCFCE7',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  successText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
