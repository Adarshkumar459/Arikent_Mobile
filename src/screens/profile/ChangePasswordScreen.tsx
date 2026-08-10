import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput as RNTextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ChangePassword'>;

// Password strength levels
const getStrength = (pwd: string): { level: number; label: string; color: string } => {
  if (!pwd) return { level: 0, label: '', color: colors.surfaceVariant };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: 1, label: 'Weak', color: colors.error };
  if (score === 2) return { level: 2, label: 'Fair', color: colors.secondary };
  if (score === 3) return { level: 3, label: 'Good', color: colors.tertiary };
  return { level: 4, label: 'Strong', color: '#0A7E5E' };
};

// Password input row
const PasswordField: React.FC<{
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
}> = ({ icon, placeholder, value, onChangeText }) => {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        pwStyles.row,
        focused && pwStyles.rowFocused,
      ]}
    >
      <Text style={pwStyles.icon}>{icon}</Text>
      <RNTextInput
        style={pwStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.outlineVariant}
        secureTextEntry={!visible}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity
        onPress={() => setVisible((v) => !v)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={pwStyles.eyeIcon}>{visible ? '👁' : '🙈'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const pwStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    overflow: 'hidden',
  },
  rowFocused: {
    borderColor: colors.primaryContainer,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.xs,
    color: colors.outline,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.onSurface,
    padding: 0,
  },
  eyeIcon: {
    fontSize: 16,
    marginLeft: spacing.xs,
    color: colors.outline,
  },
});

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  const strength = getStrength(newPassword);

  const handleUpdate = async () => {
    if (!currentPassword) {
      setErrorMsg('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setIsLoading(false);
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to change password');
    }
  };

  const handleSignOutDevices = () => {
    Alert.alert(
      'Sign out of all other devices',
      'This will log out any other active sessions.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <View style={[styles.safeArea, { paddingTop: topPad }]}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarBrand}>ARKIENT</Text>
        <View style={styles.topBarAccountIcon}>
          <Text style={styles.topBarAccountEmoji}>👤</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Page heading */}
          <View style={styles.headingSection}>
            <Text style={styles.pageTitle}>Change Password</Text>
            <Text style={styles.pageSubtitle}>
              Update your security credentials to keep your account safe.
            </Text>
          </View>

          {/* Error banner */}
          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Form card */}
          <View style={styles.formCard}>
            {/* Current Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Current Password</Text>
              <PasswordField
                icon="🔒"
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            {/* New Password + strength */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>New Password</Text>
              <PasswordField
                icon="🗝"
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
              />
              {newPassword.length > 0 ? (
                <View style={styles.strengthSection}>
                  <View style={styles.strengthHeader}>
                    <Text style={styles.strengthLabel}>Password Strength</Text>
                    <Text style={[styles.strengthValue, { color: strength.color }]}>
                      {strength.label}
                    </Text>
                  </View>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((seg) => (
                      <View
                        key={seg}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              seg <= strength.level ? strength.color : colors.surfaceVariant,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.strengthHint}>
                    Use 8+ characters with a mix of letters, numbers & symbols.
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm New Password</Text>
              <PasswordField
                icon="🗝"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Sign out other devices */}
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.signOutDevicesBtn}
              onPress={handleSignOutDevices}
              activeOpacity={0.75}
            >
              <Text style={styles.signOutDevicesIcon}>↪</Text>
              <Text style={styles.signOutDevicesText}>Sign out of all other devices</Text>
            </TouchableOpacity>
          </View>

          {/* Update Password CTA */}
          <TouchableOpacity
            style={[styles.updateBtn, isLoading && styles.updateBtnLoading]}
            onPress={handleUpdate}
            disabled={isLoading}
            activeOpacity={0.87}
          >
            <Text style={styles.updateBtnText}>
              {isLoading ? 'Updating…' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  // ── Top Bar ──────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(252,248,251,0.88)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 28,
    color: colors.primary,
    marginTop: -4,
  },
  topBarBrand: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  topBarAccountIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarAccountEmoji: {
    fontSize: 22,
    color: colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  // ── Page Heading ─────────────────────────
  headingSection: {
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  // ── Error Banner ─────────────────────────
  errorBanner: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    color: colors.onErrorContainer,
    fontSize: 13,
    fontWeight: '500',
  },
  // ── Form Card ────────────────────────────
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing['5xl'],
    shadowColor: 'rgba(108,76,232,0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },
  // ── Strength Indicator ───────────────────
  strengthSection: {
    marginTop: spacing.xs + 2,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  strengthLabel: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  strengthValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    height: 4,
  },
  strengthBar: {
    flex: 1,
    borderRadius: 2,
  },
  strengthHint: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    lineHeight: 15,
  },
  // ── Divider & Sign-out Devices ───────────
  divider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
    marginBottom: spacing.md,
  },
  signOutDevicesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.sm,
    backgroundColor: `${colors.errorContainer}30`,
    borderRadius: radius.md,
  },
  signOutDevicesIcon: {
    fontSize: 15,
    color: colors.error,
  },
  signOutDevicesText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
  // ── Update Password CTA ──────────────────
  updateBtn: {
    backgroundColor: colors.primaryContainer,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  updateBtnLoading: {
    opacity: 0.7,
  },
  updateBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});
