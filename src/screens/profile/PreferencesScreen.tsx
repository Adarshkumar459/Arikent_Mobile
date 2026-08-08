import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { DropdownInput } from '../../components/inputs';
import { PrimaryButton } from '../../components/buttons';

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

  const handleSave = () => {
    Alert.alert('Success', 'App preferences saved successfully', [
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
          label="APP THEME"
          options={THEME_OPTIONS}
          value={themePref}
          onSelect={setThemePref}
        />

        <View style={styles.actionWrapper}>
          <PrimaryButton title="Save Preferences" onPress={handleSave} />
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
    gap: spacing.md,
  },
  actionWrapper: {
    marginTop: spacing.md,
  },
});
