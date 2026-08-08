import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HabitRepository } from '../../repositories/HabitRepository';
import { HabitItem, HabitStatsData } from '../../services/api/habitApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';

type Props = NativeStackScreenProps<any, 'HabitDetails'>;

export const HabitDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { habitId } = (route.params || {}) as any;
  const insets = useSafeAreaInsets();
  const [habit, setHabit] = useState<HabitItem | null>(null);
  const [stats, setStats] = useState<HabitStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const loadData = async () => {
    if (!habitId) return;
    setIsLoading(true);
    try {
      const [h, s] = await Promise.all([
        HabitRepository.getHabitById(habitId),
        HabitRepository.getHabitStats(habitId),
      ]);
      setHabit(h);
      setStats(s);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load habit details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [habitId]);

  const handleCheckIn = async () => {
    if (!habitId) return;
    setIsCheckingIn(true);
    try {
      await HabitRepository.checkInHabit(habitId);
      await loadData();
    } catch (err: any) {
      Alert.alert('Check-in Failed', err.message || 'Failed to log check-in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Habit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await HabitRepository.deleteHabit(habitId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (isLoading) return <Loading message="Loading habit details..." />;
  if (!habit) return null;

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Habit Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}>
        <View style={styles.card}>
          <Text style={styles.title}>{habit.title}</Text>
          {habit.description ? <Text style={styles.desc}>{habit.description}</Text> : null}
          {stats ? (
            <View style={styles.statsRow}>
              <Text style={styles.stat}>Current Streak: {stats.currentStreak} days</Text>
              <Text style={styles.stat}>Best Streak: {stats.longestStreak} days</Text>
            </View>
          ) : null}
        </View>

        <Button variant="primary" label="Log Check-in Today" isLoading={isCheckingIn} onPress={handleCheckIn} />
        <Button variant="secondary" label="Edit Habit" onPress={() => navigation.navigate('EditHabit', { habitId: habit.id })} />
        <Button variant="danger" label="Delete Habit" onPress={handleDelete} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...elevation.small, gap: spacing.xs },
  title: { ...typography.heading2, color: colors.textPrimary },
  desc: { ...typography.body, color: colors.textSecondary },
  statsRow: { marginTop: spacing.md, gap: 4 },
  stat: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
});
