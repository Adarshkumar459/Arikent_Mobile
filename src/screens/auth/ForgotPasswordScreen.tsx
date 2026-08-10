import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { TextInput } from '../../components/inputs';
import { Button } from '../../components/buttons/Button';
import { authApi } from '../../services/api/authApi';
import { formatApiError } from '../../services/api/client';
import { AuthAlertModal, AlertVariant, ActionConfig } from '../../components/modals/AuthAlertModal';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    variant: AlertVariant;
    title: string;
    message: string;
    primaryAction?: ActionConfig;
    secondaryAction?: ActionConfig;
  }>({
    visible: false,
    variant: 'error',
    title: '',
    message: '',
  });

  const validate = () => {
    setEmailError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSendResetLink = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setIsLoading(false);
      navigation.navigate('VerifyOTP', { email: email.trim() });
    } catch (err: any) {
      setIsLoading(false);
      const apiErr = formatApiError(err);
      
      if (apiErr.status === 400) {
        setEmailError('Please enter a valid email address.');
      } else {
        setModalConfig({
          visible: true,
          variant: 'error',
          title: 'Unable to Send Link',
          message: apiErr.message || "We couldn't send the reset link right now. Please try again.",
          primaryAction: { label: 'Retry', onPress: () => handleSendResetLink() },
        });
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>ARKIENT</Text>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email and we'll send you a password reset link.
            </Text>
          </View>

          <View style={styles.formCard}>
            <TextInput
              label="EMAIL ADDRESS"
              placeholder="adarsh@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              error={emailError || undefined}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              variant="primary"
              label="Send Reset Link →"
              onPress={handleSendResetLink}
              isLoading={isLoading}
              disabled={isLoading}
              style={styles.sendBtn}
            />

            <TouchableOpacity style={styles.backToLoginBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backToLoginText}>Back to Log In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.illustrationWrapper}>
            <View style={styles.envelopeBox}>
              <View style={styles.planeIcon}>
                <Text style={styles.planeEmoji}>✈️</Text>
              </View>
              <Text style={styles.envelopeEmoji}>✉️</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AuthAlertModal
        visible={modalConfig.visible}
        variant={modalConfig.variant}
        title={modalConfig.title}
        message={modalConfig.message}
        primaryAction={modalConfig.primaryAction}
        secondaryAction={modalConfig.secondaryAction}
        onDismiss={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.small,
  },
  backArrow: {
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: -3,
  },
  brandBadge: {
    backgroundColor: colors.softPurple,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  brandBadgeText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.2,
  },
  header: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    gap: spacing.md,
    borderColor: '#EEF2FF',
    borderWidth: 1,
    ...elevation.medium,
  },
  sendBtn: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  backToLoginBtn: {
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  backToLoginText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '800',
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  envelopeBox: {
    width: 140,
    height: 100,
    borderRadius: radius.xl,
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...elevation.small,
  },
  envelopeEmoji: {
    fontSize: 48,
  },
  planeIcon: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.small,
  },
  planeEmoji: {
    fontSize: 18,
  },
});
