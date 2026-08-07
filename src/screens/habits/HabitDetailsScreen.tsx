import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../navigation/types';
import { HabitRepository } from '../../repositories/HabitRepository';
import { HabitItem, HabitStatsData } from '../../services/api/habitApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'HabitDetails'>;

export const HabitDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { habitId } = route.params;
  const insets = useSafeAreaInsets();
  const [habit, setHabit] = useState<HabitItem | null>(null);
  const [stats, setStats] = useState<HabitStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
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
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, habitId]);

  const handleCheckIn = async () => {
    if (!habit) return;
    setIsCheckingIn(true);
    try {
      const res = await HabitRepository.checkInHabit(habit.id);
      setHabit(res.habit);
      const updatedStats = await HabitRepository.getHabitStats(habit.id);
      setStats(updatedStats);
      Alert.alert('Success 🔥', 'Check-in recorded!');
    } catch (err: any) {
      Alert.alert('Check-in', err.message || 'Already checked in!');
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
          setIsDeleting(true);
          try {
            await HabitRepository.deleteHabit(habitId);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  if (isLoading || !habit) return <Loading message="Loading habit..." />;

  return (
    <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}>
      <View style={styles.card}>
        <Text style={styles.title}>{habit.title}</Text>
        {habit.description ? <Text style={styles.desc}>{habit.description}</Text> : null}
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionHeader}>Stats & Performance</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>🔥 {stats?.currentStreak || habit.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>🏆 {stats?.longestStreak || habit.longestStreak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>✅ {stats?.totalCheckIns || habit.totalCheckIns}</Text>
            <Text style={styles.statLabel}>Total Check-Ins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats?.completionRate || 0}%</Text>
            <Text style={styles.statLabel}>30-Day Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionGroup}>
        <Button variant="primary" label="Log Check-In" isLoading={isCheckingIn} onPress={handleCheckIn} />
        <Button variant="secondary" label="History" onPress={() => navigation.navigate('HabitHistory', { habitId: habit.id })} />
        <Button variant="secondary" label="Edit" onPress={() => navigation.navigate('EditHabit', { habitId: habit.id })} />
        <Button variant="danger" label="Delete" isLoading={isDeleting} onPress={handleDelete} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...elevation.small },
  title: { ...typography.h2, color: colors.textPrimary },
  desc: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  statsCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...elevation.small },
  sectionHeader: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statBox: { flex: 1, minWidth: '40%', alignItems: 'center', backgroundColor: colors.background, padding: spacing.md, borderRadius: radius.md },
  statNum: { ...typography.h3, color: colors.primary, fontWeight: '700' },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  actionGroup: { gap: spacing.md },
});
