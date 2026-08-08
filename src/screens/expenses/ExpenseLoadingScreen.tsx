import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { LoadingState } from '../../components/states/LoadingState';

export const ExpenseLoadingScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Expenses" />
      <View style={styles.content}>
        <LoadingState message="Loading your transactions..." />
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
