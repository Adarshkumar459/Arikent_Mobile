import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { DropdownInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';
import { useCustomAlert } from '../../components/alerts/CustomAlert';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Preferences'>;

const CURRENCY_OPTIONS = [
  { label: 'INR (₹)', value: 'INR' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
];

const START_DAY_OPTIONS = [
  { label: 'Monday', value: 'Monday' },
  { label: 'Sunday', value: 'Sunday' },
];

const THEME_OPTIONS = [
  { label: 'System Default', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export const PreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const [currency, setCurrency] = useState('INR');
  const [startDay, setStartDay] = useState('Monday');
  const [themePref, setThemePref] = useState('system');
  const { showAlert, CustomAlertModal } = useCustomAlert();

  const handleSave = () => {
    showAlert('Success', 'App preferences saved successfully', 'success', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="App Preferences" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <DropdownInput
          label="DEFAULT CURRENCY"
          options={CURRENCY_OPTIONS}
          value={currency}
          onSelect={setCurrency}
        />

        <DropdownInput
          label="START OF WEEK"
          options={START_DAY_OPTIONS}
          value={startDay}
          onSelect={setStartDay}
        />

        <DropdownInput
          label="APPEARANCE"
          options={THEME_OPTIONS}
          value={themePref}
          onSelect={setThemePref}
        />

        <PrimaryButton
          title="Save Preferences"
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </ScrollView>
      <CustomAlertModal />
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
  saveBtn: {
    marginTop: spacing.md,
  },
});
