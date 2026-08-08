import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { EmptyState } from '../../components/states/EmptyState';

export const TaskEmptyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="My Tasks" />
      <View style={styles.content}>
        <EmptyState
          title="No Tasks Found"
          description="You don't have any tasks matching your current view or filter."
          actionLabel="Add New Task"
          onAction={() => navigation.navigate('AddTask')}
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
