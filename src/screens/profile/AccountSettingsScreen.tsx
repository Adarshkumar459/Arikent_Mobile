import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/buttons/Button';
import { colors, spacing, typography, radius, elevation } from '../../theme';

const COMMON_TIMEZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export const AccountSettingsScreen: React.FC = () => {
  const { user, updateProfile, changePassword, logout, deleteAccount } = useAuth();

  // Timezone State
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    user?.timezone || 'Asia/Kolkata'
  );
  const [tzLoading, setTzLoading] = useState<boolean>(false);
  const [tzMessage, setTzMessage] = useState<string | null>(null);
  const [tzError, setTzError] = useState<string | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [passLoading, setPassLoading] = useState<boolean>(false);
  const [passMessage, setPassMessage] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Handle Timezone Update
  const handleUpdateTimezone = async () => {
    setTzLoading(true);
    setTzMessage(null);
    setTzError(null);
    try {
      await updateProfile({ timezone: selectedTimezone });
      setTzMessage(`Timezone updated to ${selectedTimezone}!`);
    } catch (err: any) {
      setTzError(err.response?.data?.message || err.message || 'Failed to update timezone');
    } finally {
      setTzLoading(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async () => {
    setPassError(null);
    setPassMessage(null);

    if (!currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    setPassLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setPassMessage('Password changed successfully! Active sessions updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Permanently', style: 'destructive', onPress: () => deleteAccount() },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section 1: Account Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.valueText}>{user?.email}</Text>

          <Text style={styles.label}>Account ID</Text>
          <Text style={styles.valueTextMono}>{user?.id}</Text>

          <Text style={styles.label}>Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {user?.isVerified ? 'Verified Account' : 'Unverified'}
            </Text>
          </View>
        </View>

        {/* Section 2: Timezone Settings */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Timezone Preferences</Text>

          {tzError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{tzError}</Text>
            </View>
          ) : null}

          {tzMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{tzMessage}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Select Preferred Timezone</Text>
          <View style={styles.tzGrid}>
            {COMMON_TIMEZONES.map((tz) => {
              const isSelected = selectedTimezone === tz;
              return (
                <TouchableOpacity
                  key={tz}
                  style={[styles.tzChip, isSelected && styles.tzChipActive]}
                  onPress={() => setSelectedTimezone(tz)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tzChipText, isSelected && styles.tzChipTextActive]}>
                    {tz}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            variant="primary"
            label="Save Timezone"
            isLoading={tzLoading}
            onPress={handleUpdateTimezone}
            style={styles.actionButton}
          />
        </View>

        {/* Section 3: Change Password */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Change Password</Text>

          {passError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{passError}</Text>
            </View>
          ) : null}

          {passMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{passMessage}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showCurrentPassword}
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {showCurrentPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Minimum 8 characters"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {showNewPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!showNewPassword}
          />

          <Button
            variant="primary"
            label="Update Password"
            isLoading={passLoading}
            onPress={handleChangePassword}
            style={styles.actionButton}
          />
        </View>

        {/* Section 4: Account Danger Zone */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
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
  valueTextMono: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  statusBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  tzGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tzChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tzChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tzChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tzChipTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    position: 'relative',
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
  toggleButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md + 4,
  },
  toggleText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  actionButton: {
    marginTop: spacing.lg,
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
