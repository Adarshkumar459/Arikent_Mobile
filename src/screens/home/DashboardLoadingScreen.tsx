import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../theme';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { LoadingState } from '../../components/states/LoadingState';

export const DashboardLoadingScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar userName="Loading..." userAvatar={null} />
      <View style={styles.content}>
        <LoadingState message="Loading your daily overview..." />
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
