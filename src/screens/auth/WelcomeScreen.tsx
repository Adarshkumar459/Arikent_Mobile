import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { PrimaryButton, SecondaryButton } from '../../components/buttons';
import { BRAND } from '../../constants/brand';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationBox}>
          <View style={styles.avatarHead} />
          <View style={styles.avatarBody} />
        </View>

        <Text style={styles.title}>Welcome to {BRAND.appName}</Text>
        <Text style={styles.subtitle}>Organize your everyday life in one simple place.</Text>

        <View style={styles.actions}>
          <PrimaryButton title="Get Started" onPress={() => navigation.navigate('Register')} />
          <SecondaryButton title="Login" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skipBtn: {
    padding: spacing.xs,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustrationBox: {
    width: 240,
    height: 180,
    borderRadius: radius.xl,
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarHead: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FBCFE8',
    borderWidth: 4,
    borderColor: '#1E293B',
    marginBottom: 4,
  },
  avatarBody: {
    width: 72,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.primary,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
});
