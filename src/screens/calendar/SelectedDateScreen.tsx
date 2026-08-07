import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { CalendarRepository } from '../../repositories/CalendarRepository';
import { CalendarEventItem } from '../../services/api/calendarApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Loading } from '../../components/feedback/Loading';
import { EmptyState } from '../../components/feedback/EmptyState';

type Props = NativeStackScreenProps<MainStackParamList, 'SelectedDate'>;

export const SelectedDateScreen: React.FC<Props> = ({ route }) => {
  const { date } = route.params;
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startStr = `${date}T00:00:00.000Z`;
    const endStr = `${date}T23:59:59.000Z`;
    CalendarRepository.getEvents({ start: startStr, end: endStr }).then((res) => {
      setEvents(res.items);
      setIsLoading(false);
    });
  }, [date]);

  if (isLoading) return <Loading message="Loading day view..." />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Overview for {date}</Text>
      {events.length === 0 ? (
        <EmptyState title="No events for this date" description="No scheduled events or milestones for this date." />
      ) : (
        <View style={styles.list}>
          {events.map((e) => (
            <View key={e.id} style={styles.card}>
              <Text style={styles.cardTitle}>{e.title}</Text>
              <Text style={styles.cardTime}>{new Date(e.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2, color: colors.textPrimary },
  list: { gap: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  cardTitle: { ...typography.h3, color: colors.textPrimary },
  cardTime: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
