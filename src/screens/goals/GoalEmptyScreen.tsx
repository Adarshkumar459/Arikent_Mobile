import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { EmptyState } from '../../components/states/EmptyState';

export const GoalEmptyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="My Goals" />
      <View style={styles.content}>
        <EmptyState
          title="No Goals Set"
          description="Set your personal, financial, or career targets and track your progress."
          actionLabel="Add First Goal"
          onAction={() => navigation.navigate('AddGoal')}
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
