import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TextInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { useAuth } from '../../context/AuthContext';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PersonalInformation'>;

export const PersonalInformationScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        timezone: timezone.trim(),
      });
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
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Personal Information" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {errorMsg ? (
            <ErrorState title="Error" message={errorMsg} onRetry={() => setErrorMsg(null)} retryLabel="Dismiss" />
          ) : null}

          <TextInput
            label="FULL NAME"
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            label="EMAIL ADDRESS"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={false}
          />

          <TextInput
            label="TIMEZONE"
            placeholder="e.g. UTC, Asia/Kolkata"
            value={timezone}
            onChangeText={setTimezone}
          />

          <View style={styles.actionWrapper}>
            <PrimaryButton
              title="Save Changes"
              onPress={handleSave}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionWrapper: {
    marginTop: spacing.md,
  },
});
