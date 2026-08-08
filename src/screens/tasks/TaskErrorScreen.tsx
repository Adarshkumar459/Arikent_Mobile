import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { ErrorState } from '../../components/states/ErrorState';

interface Props {
  errorMessage?: string;
  onRetry?: () => void;
}

export const TaskErrorScreen: React.FC<Props> = ({
  errorMessage = 'Something went wrong while fetching your tasks. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="My Tasks" />
      <View style={styles.content}>
        <ErrorState
          title="Failed to Load Tasks"
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
