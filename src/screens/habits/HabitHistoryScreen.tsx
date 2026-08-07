import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { HabitRepository } from '../../repositories/HabitRepository';
import { HabitCheckInItem } from '../../services/api/habitApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Loading } from '../../components/feedback/Loading';
import { EmptyState } from '../../components/feedback/EmptyState';

type Props = NativeStackScreenProps<MainStackParamList, 'HabitHistory'>;

export const HabitHistoryScreen: React.FC<Props> = ({ route }) => {
  const { habitId } = route.params;
  const [history, setHistory] = useState<HabitCheckInItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    HabitRepository.getHabitHistory(habitId).then((res) => {
      setHistory(res.items);
      setIsLoading(false);
    });
  }, [habitId]);

  if (isLoading) return <Loading message="Loading history..." />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Check-In History</Text>
      {history.length === 0 ? (
        <EmptyState title="No Check-Ins Yet" description="Your check-in history will appear here." />
      ) : (
        <View style={styles.list}>
          {history.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.date}>{item.checkInDate}</Text>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
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
  date: { ...typography.body, fontWeight: '700', color: colors.primary },
  note: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
});
