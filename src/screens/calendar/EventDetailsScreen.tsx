import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { CalendarRepository } from '../../repositories/CalendarRepository';
import { CalendarEventItem } from '../../services/api/calendarApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'EventDetails'>;

export const EventDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<CalendarEventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    CalendarRepository.getEventById(eventId).then((e) => {
      setEvent(e);
      setIsLoading(false);
    });
  }, [eventId]);

  const handleDelete = () => {
    Alert.alert('Delete Event', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await CalendarRepository.deleteEvent(eventId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (isLoading || !event) return <Loading message="Loading event details..." />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{event.title}</Text>
        {event.description ? <Text style={styles.desc}>{event.description}</Text> : null}
        <Text style={styles.time}>Start: {new Date(event.startAt).toLocaleString()}</Text>
        <Text style={styles.time}>End: {new Date(event.endAt).toLocaleString()}</Text>
      </View>
      <Button variant="secondary" label="Edit Event" onPress={() => navigation.navigate('EditEvent', { eventId: event.id })} />
      <Button variant="danger" label="Delete Event" onPress={handleDelete} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...elevation.small },
  title: { ...typography.h2, color: colors.textPrimary },
  desc: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  time: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
});
