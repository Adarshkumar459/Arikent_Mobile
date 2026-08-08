import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { SecondaryButton, DangerButton } from '../../components/buttons';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SecuritySettings'>;

export const SecuritySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();

  const handleLogoutAll = () => {
    Alert.alert('Log Out All Devices', 'Are you sure you want to log out from all active sessions?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out All',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Security & Privacy" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PASSWORD SECURITY</Text>
          <Text style={styles.cardSubtitle}>
            Your password was last set during account registration or last update.
          </Text>
          <SecondaryButton
            title="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>ACTIVE SESSION</Text>
          <Text style={styles.cardSubtitle}>Current Device: Mobile Application Client (Authenticated)</Text>
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
