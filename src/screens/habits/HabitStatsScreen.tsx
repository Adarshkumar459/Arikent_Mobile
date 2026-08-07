import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { HabitRepository } from '../../repositories/HabitRepository';
import { HabitStatsData } from '../../services/api/habitApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'HabitStats'>;

export const HabitStatsScreen: React.FC<Props> = ({ route }) => {
  const { habitId } = route.params;
  const [stats, setStats] = useState<HabitStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    HabitRepository.getHabitStats(habitId).then((res) => {
      setStats(res);
      setIsLoading(false);
    });
  }, [habitId]);

  if (isLoading || !stats) return <Loading message="Loading stats..." />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Habit Analytics</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Current Streak</Text>
        <Text style={styles.val}>🔥 {stats.currentStreak} Days</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Longest Streak</Text>
        <Text style={styles.val}>🏆 {stats.longestStreak} Days</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Total Check-Ins</Text>
        <Text style={styles.val}>✅ {stats.totalCheckIns}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>30-Day Completion Rate</Text>
        <Text style={styles.val}>📈 {stats.completionRate}%</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2, color: colors.textPrimary },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  label: { ...typography.caption, color: colors.textSecondary },
  val: { ...typography.h2, color: colors.primary, marginTop: spacing.xs },
});
