import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { ReminderItem } from '../../services/api/reminderApi';

type Props = NativeStackScreenProps<CalendarStackParamList, 'SelectedDate'>;

const HOURS = [
  '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
  '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'
];

export const SelectedDateScreen: React.FC<Props> = ({ route, navigation }) => {
  const { date } = route.params || {};
  const activeDate = date ? new Date(date) : new Date(2026, 7, 12);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const formattedHeaderDate = activeDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const fetchDateReminders = async () => {
    setIsLoading(true);
    try {
      const res = await ReminderRepository.getReminders();
      const filtered = res.items.filter((item) => {
        if (!item.scheduledAt) return false;
        const d = new Date(item.scheduledAt);
        return (
          d.getFullYear() === activeDate.getFullYear() &&
          d.getMonth() === activeDate.getMonth() &&
          d.getDate() === activeDate.getDate()
        );
      });
      setReminders(filtered);
    } catch (err: any) {
      console.log('Error fetching reminders for selected date:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDateReminders();
    });
    return unsubscribe;
  }, [navigation, date]);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScreenHeader
        title={formattedHeaderDate}
        subtitle="Day Agenda"
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Text style={{ fontSize: 18 }}>📅</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Timeline Grid Canvas */}
          <View style={styles.timelineCanvas}>
            {HOURS.map((hourText, idx) => (
              <View key={hourText} style={styles.hourRow}>
                <View style={styles.hourLabelCol}>
                  <Text style={styles.hourLabelText}>{hourText}</Text>
                </View>
                <View style={styles.hourGridLine} />
              </View>
            ))}

            {/* Event Items Overlay */}
            {reminders.length === 0 ? (
              <View style={styles.emptyOverlay}>
                <Text style={styles.emptyText}>No scheduled agenda items for this day.</Text>
              </View>
            ) : (
              <View style={styles.eventsContainer}>
                {reminders.map((item, index) => {
                  const eventDate = item.scheduledAt ? new Date(item.scheduledAt) : activeDate;
                  const hour = eventDate.getHours();
                  const mins = eventDate.getMinutes();
                  
                  // Calculate top position based on 8 AM baseline (60px per hour)
                  const startHourOffset = Math.max(hour - 8, 0);
                  const topPos = startHourOffset * 60 + (mins / 60) * 60 + 10;

                  const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const accentColor =
                    item.type === 'goal'
                      ? '#007856'
                      : item.type === 'task'
                      ? colors.primary
                      : colors.primaryContainer;

                  return (
                    <TouchableOpacity
                      key={item.id || index}
                      style={[
                        styles.agendaCard,
                        { top: topPos, borderLeftColor: accentColor },
                      ]}
                      onPress={() => navigation.navigate('ReminderDetails', { reminderId: item.id })}
                      activeOpacity={0.88}
                    >
                      <View style={styles.agendaHeaderRow}>
                        <Text style={styles.agendaTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <View style={[styles.typeBadge, { backgroundColor: accentColor + '20' }]}>
                          <Text style={[styles.typeBadgeText, { color: accentColor }]}>
                            {item.type ? item.type.toUpperCase() : 'EVENT'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.agendaTimeText}>⏰ {timeStr}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Floating Add Event CTA */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddReminder')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: 80,
  },
  timelineCanvas: {
    position: 'relative',
    minHeight: 780,
    marginTop: spacing.sm,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 60,
  },
  hourLabelCol: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: spacing.sm,
  },
  hourLabelText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.outline,
    fontWeight: '600',
    marginTop: -6,
  },
  hourGridLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceContainerHighest,
    marginTop: 0,
  },
  eventsContainer: {
    position: 'absolute',
    left: 64,
    right: 0,
    top: 0,
    bottom: 0,
  },
  agendaCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 52,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    justifyContent: 'center',
    ...elevation.small,
  },
  agendaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agendaTitle: {
    ...typography.heading4,
    fontSize: 14,
    color: colors.onSurface,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  agendaTimeText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.outline,
    marginTop: 2,
  },
  emptyOverlay: {
    position: 'absolute',
    left: 64,
    right: 0,
    top: 100,
    padding: spacing.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.outline,
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
