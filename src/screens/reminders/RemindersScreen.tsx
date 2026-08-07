import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../navigation/types';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { ReminderItem, ReminderType } from '../../services/api/reminderApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/feedback/EmptyState';

type Props = NativeStackScreenProps<MainStackParamList, 'Reminders'>;

export const RemindersScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const res = await ReminderRepository.getReminders(filterType !== 'all' ? { type: filterType as ReminderType } : undefined);
      setReminders(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchReminders);
    return unsubscribe;
  }, [navigation, filterType]);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchReminders(); }} colors={[colors.primary]} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <Button variant="primary" label="+ Add Reminder" onPress={() => navigation.navigate('CreateReminder')} />
      </View>

      <View style={styles.chipRow}>
        {(['all', 'task', 'bill', 'goal', 'general'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.chip, filterType === t && styles.chipActive]} onPress={() => setFilterType(t)}>
            <Text style={[styles.chipText, filterType === t && styles.chipTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !isRefreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : reminders.length === 0 ? (
        <EmptyState title="No Reminders Scheduled" description="Keep track of upcoming bills, tasks and goals." actionLabel="+ Add Reminder" onAction={() => navigation.navigate('CreateReminder')} />
      ) : (
        <View style={styles.list}>
          {reminders.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card} onPress={() => navigation.navigate('ReminderDetails', { reminderId: item.id })}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.cardDate}>Scheduled: {new Date(item.scheduledAt).toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h2, color: colors.textPrimary },
  chipRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  chip: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: '#FFF' },
  list: { gap: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, ...elevation.small },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...typography.h3, color: colors.textPrimary },
  typeBadge: { backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  typeText: { ...typography.caption, fontSize: 10, color: colors.textSecondary, fontWeight: '700' },
  cardDate: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
});
