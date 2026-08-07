import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { HabitRepository } from '../../repositories/HabitRepository';
import { HabitItem } from '../../services/api/habitApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/feedback/EmptyState';

type Props = NativeStackScreenProps<MainStackParamList, 'Habits'>;

export const HabitsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHabits = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await HabitRepository.getHabits({ status: filter });
      setHabits(res.items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load habits');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchHabits(true);
    });
    return unsubscribe;
  }, [navigation, filter]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHabits(false);
  }, [filter]);

  const handleCheckIn = async (habit: HabitItem) => {
    setCheckingInId(habit.id);
    try {
      const res = await HabitRepository.checkInHabit(habit.id);
      setHabits((prev) => prev.map((h) => (h.id === habit.id ? res.habit : h)));
      Alert.alert('Success 🔥', `Streak increased to ${res.habit.currentStreak} days!`);
    } catch (err: any) {
      Alert.alert('Check-in', err.message || 'Already checked in for today!');
    } finally {
      setCheckingInId(null);
    }
  };

  const todayStr = new Date().toISOString().substring(0, 10);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenTitle}>My Habits</Text>
            <Text style={styles.screenSubtitle}>Build consistency & streak fire</Text>
          </View>
          <Button
            variant="primary"
            label="+ Add Habit"
            onPress={() => navigation.navigate('CreateHabit')}
          />
        </View>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Button variant="secondary" label="Retry" onPress={() => fetchHabits(true)} />
          </View>
        ) : null}

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterTabText, filter === 'active' && styles.filterTabTextActive]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'archived' && styles.filterTabActive]}
            onPress={() => setFilter('archived')}
          >
            <Text style={[styles.filterTabText, filter === 'archived' && styles.filterTabTextActive]}>Archived</Text>
          </TouchableOpacity>
        </View>

        {isLoading && !isRefreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching habits...</Text>
          </View>
        ) : habits.length === 0 ? (
          <EmptyState
            title="No Habits Found"
            description="Start building consistency by adding your first daily or weekly habit."
            actionLabel="+ Add Habit"
            onAction={() => navigation.navigate('CreateHabit')}
          />
        ) : (
          <View style={styles.habitList}>
            {habits.map((item) => {
              const isCheckedInToday = item.lastCheckInAt && item.lastCheckInAt.substring(0, 10) === todayStr;
              const isCheckingIn = checkingInId === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.habitCard}
                  onPress={() => navigation.navigate('HabitDetails', { habitId: item.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.titleArea}>
                      <Text style={styles.habitTitle}>{item.title}</Text>
                      {item.description ? <Text style={styles.habitDesc}>{item.description}</Text> : null}
                    </View>
                    <View style={styles.streakBadge}>
                      <Text style={styles.streakText}>🔥 {item.currentStreak}</Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.badgeRow}>
                      <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>{item.frequency.toUpperCase()}</Text>
                      </View>
                      {item.reminder?.enabled && item.reminder.time ? (
                        <Text style={styles.reminderText}>⏰ {item.reminder.time}</Text>
                      ) : null}
                    </View>

                    <Button
                      variant={isCheckedInToday ? 'secondary' : 'primary'}
                      label={isCheckingIn ? '...' : isCheckedInToday ? 'Done ✓' : 'Check In'}
                      disabled={isCheckedInToday || isCheckingIn}
                      onPress={() => handleCheckIn(item)}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  screenTitle: { ...typography.h2, color: colors.textPrimary },
  screenSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  errorCard: { backgroundColor: '#FEE2E2', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg, alignItems: 'center' },
  errorText: { ...typography.bodySmall, color: colors.error, marginBottom: spacing.xs },
  filterBar: { flexDirection: 'row', backgroundColor: colors.surface, padding: spacing.xs, borderRadius: radius.lg, marginBottom: spacing.lg },
  filterTab: { flex: 1, paddingVertical: spacing.xs, alignItems: 'center', borderRadius: radius.md },
  filterTabActive: { backgroundColor: colors.primary },
  filterTabText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  filterTabTextActive: { color: '#FFFFFF' },
  loadingBox: { paddingVertical: spacing['2xl'], alignItems: 'center' },
  loadingText: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.md },
  habitList: { gap: spacing.md },
  habitCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...elevation.small },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  titleArea: { flex: 1, marginRight: spacing.md },
  habitTitle: { ...typography.h3, color: colors.textPrimary },
  habitDesc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  streakBadge: { backgroundColor: '#FFEDD5', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  streakText: { ...typography.caption, color: '#C2410C', fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tagBadge: { backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  tagText: { ...typography.caption, fontSize: 10, color: colors.textSecondary, fontWeight: '700' },
  reminderText: { ...typography.caption, color: colors.textSecondary },
});
