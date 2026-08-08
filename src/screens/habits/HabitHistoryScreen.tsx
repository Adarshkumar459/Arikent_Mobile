import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HabitRepository } from '../../repositories/HabitRepository';
import { HabitCheckInItem } from '../../services/api/habitApi';
import { colors, spacing, typography, radius } from '../../theme';
import { Loading } from '../../components/feedback/Loading';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';

type Props = NativeStackScreenProps<any, 'HabitHistory'>;

export const HabitHistoryScreen: React.FC<Props> = ({ route, navigation }) => {
  const { habitId } = (route.params || {}) as any;
  const [history, setHistory] = useState<HabitCheckInItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (habitId) {
      HabitRepository.getHabitHistory(habitId).then((res) => {
        setHistory(res.items);
        setIsLoading(false);
      });
    }
  }, [habitId]);

  if (isLoading) return <Loading message="Loading history..." />;

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Check-In History" onBack={() => navigation?.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        {history.length === 0 ? (
          <EmptyState title="No Check-Ins Yet" description="Your check-in history will appear here." />
        ) : (
          <View style={styles.list}>
            {history.map((item) => (
              <View key={item.id} style={styles.row}>
                <Text style={styles.date}>{item.checkInDate || item.date}</Text>
                <Text style={styles.status}>Completed</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.md },
  list: { gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md },
  date: { ...typography.body, color: colors.textPrimary },
  status: { ...typography.bodySmall, color: colors.success, fontWeight: '700' },
});
