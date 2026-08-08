import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { CategoryChip } from '../../components/chips/CategoryChip';
import { ReminderCard } from '../../components/cards/ReminderCard';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { ReminderItem, ReminderType } from '../../services/api/reminderApi';
import { RemindersEmptyScreen } from './RemindersEmptyScreen';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';

type Props = NativeStackScreenProps<CalendarStackParamList, 'Reminders'>;

const CATEGORIES: Array<{ label: string; value?: ReminderType }> = [
  { label: 'All' },
  { label: 'General', value: 'general' },
  { label: 'Task', value: 'task' },
  { label: 'Goal', value: 'goal' },
  { label: 'Bill', value: 'bill' },
  { label: 'Calendar', value: 'calendar' },
];

export const RemindersScreen: React.FC<Props> = ({ navigation }) => {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [selectedType, setSelectedType] = useState<ReminderType | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReminders = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await ReminderRepository.getReminders({
        type: selectedType,
      });
      setReminders(res.items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch reminders');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReminders(reminders.length === 0);
    });
    return unsubscribe;
  }, [navigation, selectedType]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchReminders(false);
  }, [selectedType]);

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Reminders" />
        <View style={styles.centered}>
          <LoadingState message="Loading your reminders..." />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg && reminders.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Reminders" />
        <View style={styles.centered}>
          <ErrorState message={errorMsg} onRetry={() => fetchReminders(true)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Reminders" />

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.label}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <CategoryChip
              label={item.label}
              selected={selectedType === item.value}
              onPress={() => setSelectedType(item.value)}
            />
          )}
        />
      </View>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <RemindersEmptyScreen />
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ReminderDetails', { reminderId: item.id })}
            >
              <ReminderCard
                title={item.title}
                time={new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                date={new Date(item.scheduledAt).toLocaleDateString()}
                category={item.type}
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Add Reminder CTA */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddReminder')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    marginVertical: spacing.xs,
  },
  categoryList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
    gap: spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.large,
  },
  fabText: {
    color: colors.surface,
    fontSize: 32,
    fontWeight: '400',
    marginTop: -3,
  },
});
