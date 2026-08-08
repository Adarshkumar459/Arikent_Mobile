import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { ErrorState } from '../../components/states/ErrorState';

interface Props {
  errorMessage?: string;
  onRetry?: () => void;
}

export const GoalErrorScreen: React.FC<Props> = ({
  errorMessage = 'Something went wrong while fetching your goals. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="My Goals" />
      <View style={styles.content}>
        <ErrorState
          title="Failed to Load Goals"
          message={errorMessage}
          retryLabel="Retry"
          onRetry={onRetry}
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
