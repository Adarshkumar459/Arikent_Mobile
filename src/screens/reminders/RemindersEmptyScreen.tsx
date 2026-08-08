import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { EmptyState } from '../../components/states/EmptyState';

export const RemindersEmptyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Reminders" />
      <View style={styles.content}>
        <EmptyState
          title="No Reminders Found"
          description="You don't have any reminders scheduled."
          actionLabel="Add Reminder"
          onAction={() => navigation.navigate('AddReminder')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
});
