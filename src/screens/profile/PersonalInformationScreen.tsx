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

type Props = NativeStackScreenProps<ProfileStackParamList, 'PersonalInformation'>;

// Simple floating-label input that matches the Stitch design
const FloatingInput: React.FC<{
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  editable?: boolean;
  icon?: string;
  keyboardType?: any;
}> = ({ label, value, onChangeText, placeholder, editable = true, icon, keyboardType }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.floatingLabel}>{label}</Text>
      <View
        style={[
          inputStyles.inputRow,
          focused && inputStyles.inputRowFocused,
          !editable && inputStyles.inputRowDisabled,
        ]}
      >
        {icon ? <Text style={inputStyles.icon}>{icon}</Text> : null}
        <RNTextInput
          style={inputStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outlineVariant}
          editable={editable}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
};

const inputStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginTop: spacing.sm,
  },
  floatingLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    marginBottom: 4,
    marginLeft: spacing.sm,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  inputRowFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  inputRowDisabled: {
    backgroundColor: colors.surfaceContainerLow,
    opacity: 0.7,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.sm,
    color: colors.outlineVariant,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: '400',
    padding: 0,
  },
});

export const PersonalInformationScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  const getInitials = (n?: string) => {
    if (!n) return 'U';
    return n.split(' ').map((p) => p[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await updateProfile({ name: name.trim(), timezone: timezone.trim() });
      setIsLoading(false);
      Alert.alert('Success', 'Personal information updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to update profile');
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Edit Profile</Text>
        <View style={styles.topBarSpacer} />
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
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{getInitials(user?.name)}</Text>
            </View>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </View>

          {/* Error */}
          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Form card */}
          <View style={styles.formCard}>
            <FloatingInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />
            <FloatingInput
              label="Email Address"
              value={email}
              placeholder="name@example.com"
              editable={false}
              icon="✉️"
              keyboardType="email-address"
            />
            <FloatingInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 000-0000"
              icon="📞"
              keyboardType="phone-pad"
            />
            <FloatingInput
              label="Timezone"
              value={timezone}
              onChangeText={setTimezone}
              placeholder="e.g. Asia/Kolkata"
              icon="🌐"
            />

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveBtn, isLoading && styles.saveBtnLoading]}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              <Text style={styles.saveBtnText}>
                {isLoading ? 'Saving…' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
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
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
  backBtnText: {
    fontSize: 28,
    color: colors.onSurface,
    marginTop: -4,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
    letterSpacing: -0.2,
  },
  topBarSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  // ── Avatar ────────────────────────────────
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surfaceContainerHighest,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.1,
  },
  // ── Error ─────────────────────────────────
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
  // ── Form Card ─────────────────────────────
  formCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.xs,
    shadowColor: 'rgba(108,76,232,0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  // ── Save Button ───────────────────────────
  saveBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnLoading: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});
