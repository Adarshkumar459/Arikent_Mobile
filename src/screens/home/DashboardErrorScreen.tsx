import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../theme';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { ErrorState } from '../../components/states/ErrorState';

interface Props {
  errorMessage?: string;
  onRetry?: () => void;
}

export const DashboardErrorScreen: React.FC<Props> = ({
  errorMessage = 'Something went wrong while fetching your data. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar userName="Hello 👋" userAvatar={null} />
      <View style={styles.content}>
        <ErrorState
          title="Unable to Load Dashboard"
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
