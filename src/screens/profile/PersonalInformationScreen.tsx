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
import { sanitize10Digits, toFullIndianPhone, isValid10DigitMobile } from '../../utils/phoneUtils';
import { useCustomAlert } from '../../components/alerts/CustomAlert';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PersonalInformation'>;

// Simple floating-label input matching the design system
const FloatingInput: React.FC<{
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  editable?: boolean;
  icon?: string;
  keyboardType?: any;
  maxLength?: number;
}> = ({ label, value, onChangeText, placeholder, editable = true, icon, keyboardType, maxLength }) => {
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
          maxLength={maxLength}
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
  // 2-Part Phone Input Row
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countryFlag: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  phoneDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: spacing.md,
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: '500',
    padding: 0,
    letterSpacing: 0.5,
  },
});

export const PersonalInformationScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const { showAlert, CustomAlertModal } = useCustomAlert();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phoneDigits, setPhoneDigits] = useState(sanitize10Digits(user?.phone));
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
    const cleanDigits = sanitize10Digits(phoneDigits);
    if (cleanDigits.length > 0 && cleanDigits.length !== 10) {
      setErrorMsg('Mobile number must be exactly 10 digits.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        timezone: timezone.trim(),
        phone: cleanDigits.length === 10 ? toFullIndianPhone(cleanDigits) : undefined,
      });
      setIsLoading(false);
      showAlert('Success', 'Personal information updated successfully', 'success', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to update profile');
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: topPad }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

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

            {/* Mobile Number Field (2 Separate Parts: Fixed +91 Badge + 10 Digits Input) */}
            <View style={inputStyles.wrapper}>
              <Text style={inputStyles.floatingLabel}>Phone Number</Text>
              <View style={inputStyles.phoneInputRow}>
                <View style={inputStyles.countryBadge}>
                  <Text style={inputStyles.countryFlag}>🇮🇳</Text>
                  <Text style={inputStyles.countryCodeText}>+91</Text>
                </View>
                <View style={inputStyles.phoneDivider} />
                <RNTextInput
                  style={inputStyles.phoneTextInput}
                  value={phoneDigits}
                  onChangeText={(val) => setPhoneDigits(val.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  placeholderTextColor={colors.outlineVariant}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

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
      <CustomAlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
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
