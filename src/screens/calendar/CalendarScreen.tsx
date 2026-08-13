import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { ReminderItem } from '../../services/api/reminderApi';
import { DatePickerModal } from '../../components/modals/DatePickerModal';
import { useTabNav } from '../../context/TabContext';

type Props = NativeStackScreenProps<CalendarStackParamList, 'Calendar'>;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const { switchTab } = useTabNav();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 7, 12)); // August 12, 2026
  const [activeMonthDate, setActiveMonthDate] = useState<Date>(new Date(2026, 7, 1));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchRemindersData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await ReminderRepository.getReminders();
      setReminders(res.items);
    } catch (err: any) {
      console.log('Error fetching reminders:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRemindersData(reminders.length === 0);
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRemindersData(false);
  }, []);

  const handlePrevMonth = () => {
    setActiveMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setActiveMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const monthFormatted = activeMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calendar Grid Builder
  const year = activeMonthDate.getFullYear();
  const month = activeMonthDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const handleDatePress = (dayNum: number) => {
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setSelectedDate(new Date(year, month, dayNum));
    navigation.navigate('SelectedDate', { date: targetDateStr });
  };

  // Schedule for selected date
  const scheduleForSelectedDate = reminders.filter((item) => {
    if (!item.scheduledAt) return false;
    const d = new Date(item.scheduledAt);
    return (
      d.getFullYear() === selectedDate.getFullYear() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getDate() === selectedDate.getDate()
    );
  });

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScreenHeader title="Calendar" onBackPress={() => switchTab('Home')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Month Selector Bar */}
        <View style={styles.monthHeaderSection}>
          <Text style={styles.pageTitle}>Overview</Text>

          <View style={styles.monthSelectorBar}>
            <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevMonth}>
              <Text style={styles.arrowIcon}>‹</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.monthTitleRow}
              onPress={() => setIsDatePickerOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.monthText}>{monthFormatted}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.arrowBtn} onPress={handleNextMonth}>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Glassmorphic Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Weekday Headers */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={styles.weekdayText}>
                {day.toUpperCase()}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {/* Previous Month Trail */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const dayNum = prevMonthTotalDays - firstDayIndex + i + 1;
              return (
                <View key={`prev-${i}`} style={styles.dayCellDim}>
                  <Text style={styles.dayTextDim}>{dayNum}</Text>
                </View>
              );
            })}

            {/* Current Month Days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                selectedDate.getDate() === dayNum &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

              const hasReminder = reminders.some((r) => {
                if (!r.scheduledAt) return false;
                const rd = new Date(r.scheduledAt);
                return rd.getFullYear() === year && rd.getMonth() === month && rd.getDate() === dayNum;
              });

              return (
                <TouchableOpacity
                  key={`day-${dayNum}`}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  onPress={() => handleDatePress(dayNum)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {dayNum}
                  </Text>
                  {hasReminder && !isSelected ? <View style={styles.eventDot} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Schedule Section for Selected Date */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Schedule for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>

          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : scheduleForSelectedDate.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No events or reminders scheduled for this date.</Text>
            </View>
          ) : (
            <View style={styles.scheduleList}>
              {scheduleForSelectedDate.map((item) => {
                const timeStr = item.scheduledAt
                  ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'All Day';

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.scheduleCard}
                    onPress={() => navigation.navigate('ReminderDetails', { reminderId: item.id })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.timeCol}>
                      <Text style={styles.timeText}>{timeStr}</Text>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.scheduleBody}>
                      <Text style={styles.scheduleTitle}>{item.title}</Text>
                      <View style={styles.categoryChip}>
                        <Text style={styles.categoryChipText}>{item.type ? item.type.toUpperCase() : 'EVENT'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Event CTA */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddReminder')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Date Picker Modal for month selection */}
      <DatePickerModal
        visible={isDatePickerOpen}
        initialDate={activeMonthDate.toISOString()}
        onConfirm={(iso) => {
          setActiveMonthDate(new Date(iso));
          setIsDatePickerOpen(false);
        }}
        onCancel={() => setIsDatePickerOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 80,
  },
  monthHeaderSection: {
    gap: spacing.xs,
  },
  pageTitle: {
    ...typography.heading1,
    fontSize: 22,
    color: colors.onSurface,
    fontWeight: '800',
  },
  monthSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  monthTitleRow: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  monthText: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.primaryContainer,
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    gap: spacing.md,
    ...elevation.small,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  weekdayText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.outline,
    width: 36,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: colors.primaryContainer,
    ...elevation.small,
  },
  dayCellDim: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurface,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: colors.textLight,
    fontWeight: '800',
  },
  dayTextDim: {
    ...typography.body,
    fontSize: 13,
    color: colors.outlineVariant,
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryContainer,
  },
  sectionContainer: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 17,
    color: colors.onSurface,
    fontWeight: '700',
  },
  scheduleList: {
    gap: spacing.sm,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...elevation.small,
  },
  timeCol: {
    minWidth: 64,
  },
  timeText: {
    ...typography.heading4,
    fontSize: 14,
    color: colors.onSurface,
    fontWeight: '700',
  },
  cardDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.surfaceContainerHighest,
    marginHorizontal: spacing.md,
  },
  scheduleBody: {
    flex: 1,
    gap: 2,
  },
  scheduleTitle: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: '700',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  categoryChipText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
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
