import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoalsStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius } from '../../theme';
import { PrimaryButton } from '../../components/buttons';

type Props = NativeStackScreenProps<GoalsStackParamList, 'GoalCompleted'>;

export const GoalCompletedScreen: React.FC<Props> = ({ route, navigation }) => {
  const goalId = route.params?.goalId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Text style={styles.trophyIcon}>🏆</Text>
        </View>

        <Text style={styles.title}>Goal Achieved! 🎉</Text>
        <Text style={styles.subtitle}>
          Congratulations! You've successfully reached 100% of your target. Keep up the great work!
        </Text>

        <View style={styles.actions}>
          <PrimaryButton
            title="View Goal Details"
            onPress={() => {
              if (goalId) {
                navigation.replace('GoalDetails', { goalId });
              } else {
                navigation.navigate('GoalList');
              }
            }}
          />
        </View>
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
    paddingHorizontal: spacing.xl,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.successBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  trophyIcon: {
    fontSize: 48,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['2xl'],
  },
  actions: {
    width: '100%',
  },
});
