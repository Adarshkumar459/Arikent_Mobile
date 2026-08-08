import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HabitRepository } from '../../repositories/HabitRepository';
import { HabitStatsData } from '../../services/api/habitApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Loading } from '../../components/feedback/Loading';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';

type Props = NativeStackScreenProps<any, 'HabitStats'>;

export const HabitStatsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { habitId } = (route.params || {}) as any;
  const [stats, setStats] = useState<HabitStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (habitId) {
      HabitRepository.getHabitStats(habitId).then((res) => {
        setStats(res);
        setIsLoading(false);
      });
    }
  }, [habitId]);

  if (isLoading || !stats) return <Loading message="Loading stats..." />;

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Habit Analytics" onBack={() => navigation?.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Current Streak</Text>
          <Text style={styles.val}>🔥 {stats.currentStreak} Days</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Best Streak</Text>
          <Text style={styles.val}>🏆 {stats.longestStreak} Days</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Completion Rate</Text>
          <Text style={styles.val}>📈 {stats.completionRate}%</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  label: { ...typography.caption, color: colors.textSecondary },
  val: { ...typography.heading2, color: colors.primary, marginTop: spacing.xs },
});
