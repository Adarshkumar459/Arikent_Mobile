import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/buttons/Button';
import { Logo } from '../../components/brand/Logo';
import { colors, spacing, typography, radius, elevation } from '../../theme';

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setMessage(null);
    try {
      await updateProfile({ name });
      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Update failed');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Logo size="lg" />
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Verified Account</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account Overview</Text>

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

        <Text style={styles.label}>Name</Text>
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

        <Text style={styles.label}>Account ID</Text>
        <Text style={styles.valueTextMono}>{user?.id}</Text>

        <View style={styles.buttonGroup}>
          {editing ? (
            <>
              <Button
                variant="primary"
                label="Save Changes"
                isLoading={loading}
                onPress={handleUpdateProfile}
                style={styles.actionButton}
              />
              <Button
                variant="ghost"
                label="Cancel"
                onPress={() => {
                  setName(user?.name || '');
                  setEditing(false);
                }}
                style={styles.actionButton}
              />
            </>
          ) : (
            <Button
              variant="outline"
              label="Edit Profile"
              onPress={() => setEditing(true)}
              style={styles.actionButton}
            />
          )}

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
  userName: {
    ...typography.h2,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
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
  valueTextMono: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
