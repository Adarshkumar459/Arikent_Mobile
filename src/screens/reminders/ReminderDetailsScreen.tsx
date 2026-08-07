import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { ReminderItem } from '../../services/api/reminderApi';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { Button } from '../../components/buttons/Button';
import { Loading } from '../../components/feedback/Loading';

type Props = NativeStackScreenProps<MainStackParamList, 'ReminderDetails'>;

export const ReminderDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { reminderId } = route.params;
  const [reminder, setReminder] = useState<ReminderItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ReminderRepository.getReminderById(reminderId).then((r) => {
      setReminder(r);
      setIsLoading(false);
    });
  }, [reminderId]);

  const handleDelete = () => {
    Alert.alert('Delete Reminder', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await ReminderRepository.deleteReminder(reminderId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (isLoading || !reminder) return <Loading message="Loading reminder..." />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{reminder.title}</Text>
        <Text style={styles.type}>Category: {reminder.type.toUpperCase()}</Text>
        <Text style={styles.time}>Scheduled: {new Date(reminder.scheduledAt).toLocaleString()}</Text>
        <Text style={styles.time}>Status: {reminder.status}</Text>
      </View>
      <Button variant="secondary" label="Edit Reminder" onPress={() => navigation.navigate('EditReminder', { reminderId: reminder.id })} />
      <Button variant="danger" label="Delete Reminder" onPress={handleDelete} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...elevation.small },
  title: { ...typography.h2, color: colors.textPrimary },
  type: { ...typography.body, color: colors.primary, marginTop: spacing.xs, fontWeight: '700' },
  time: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
});
