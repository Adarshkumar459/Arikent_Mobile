import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../navigation/types';
import { CalendarRepository } from '../../repositories/CalendarRepository';
import { CalendarEventItem } from '../../services/api/calendarApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/feedback/EmptyState';

type Props = NativeStackScreenProps<MainStackParamList, 'Calendar'>;

export const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await CalendarRepository.getEvents();
      setEvents(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchEvents);
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) }]}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchEvents(); }} colors={[colors.primary]} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Calendar & Events</Text>
        <Button variant="primary" label="+ Add Event" onPress={() => navigation.navigate('CreateEvent')} />
      </View>

      {isLoading && !isRefreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : events.length === 0 ? (
        <EmptyState title="No Calendar Events" description="Schedule meetings, events or milestones." actionLabel="+ Add Event" onAction={() => navigation.navigate('CreateEvent')} />
      ) : (
        <View style={styles.list}>
          {events.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card} onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventTime}>{new Date(item.startAt).toLocaleString()}</Text>
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
  list: { gap: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, ...elevation.small },
  eventTitle: { ...typography.h3, color: colors.textPrimary },
  eventTime: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
