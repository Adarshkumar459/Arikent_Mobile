import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../theme';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { EmptyState } from '../../components/states/EmptyState';

export const DashboardEmptyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar userName="Hello 👋" userAvatar={null} />
      <View style={styles.content}>
        <EmptyState
          title="Your Dashboard is Empty"
          description="You don't have any active tasks, goals, or reminders scheduled for today."
          actionLabel="Add First Task"
          onAction={() => navigation.navigate('Tasks', { screen: 'AddTask' })}
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
