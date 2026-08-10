import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { TaskRepository } from '../../repositories/TaskRepository';
import { ReminderRepository } from '../../repositories/ReminderRepository';
import { useTabNav } from '../../context/TabContext';

type Props = NativeStackScreenProps<CalendarStackParamList, 'Calendar'>;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const { switchTab } = useTabNav();
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const [scheduledDates, setScheduledDates] = useState<Set<string>>(new Set());

  const fetchScheduledDates = async () => {
    try {
      const [taskRes, reminderRes] = await Promise.all([
        TaskRepository.getTasks(),
        ReminderRepository.getReminders(),
      ]);
      const dates = new Set<string>();
      taskRes.items.forEach((t) => {
        if (t.dueDate) dates.add(t.dueDate.substring(0, 10));
      });
      reminderRes.items.forEach((r) => {
        if (r.scheduledAt) dates.add(r.scheduledAt.substring(0, 10));
      });
      setScheduledDates(dates);
    } catch {
      setScheduledDates(new Set());
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchScheduledDates();
    });
    return unsubscribe;
  }, [navigation]);

  const handlePrevMonth = () => {
    const [yStr, mStr] = currentYearMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setCurrentYearMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yStr, mStr] = currentYearMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setCurrentYearMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const monthFormatted = (() => {
    const [yStr, mStr] = currentYearMonth.split('-');
    const dateObj = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, 1);
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  })();

  const renderCalendarGrid = () => {
    const [yearStr, monthStr] = currentYearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const todayStr = new Date().toISOString().substring(0, 10);

    const gridItems = [];
    for (let i = 0; i < firstDayIndex; i++) {
      gridItems.push(<View key={`blank-${i}`} style={styles.emptyDayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDay = String(day).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${formattedDay}`;
      const isToday = todayStr === dateStr;
      const hasEvents = scheduledDates.has(dateStr);

      gridItems.push(
        <TouchableOpacity
          key={dateStr}
          style={[styles.dayCell, isToday && styles.todayCell]}
          onPress={() => navigation.navigate('SelectedDate', { date: dateStr })}
        >
          <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
          {hasEvents ? <View style={styles.eventDot} /> : <View style={styles.dotPlaceholder} />}
        </TouchableOpacity>
      );
    }

    return gridItems;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Calendar"
        onBackPress={() => switchTab('Home')}
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('Reminders')}>
            <Text style={styles.remindersIcon}>⏰</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Month Navigation */}
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>{monthFormatted}</Text>
          <View style={styles.navButtons}>
            <TouchableOpacity style={styles.navArrow} onPress={handlePrevMonth}>
              <Text style={styles.arrowText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navArrow} onPress={handleNextMonth}>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Grid Container */}
        <View style={styles.gridCard}>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={styles.weekdayText}>
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>{renderCalendarGrid()}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  remindersIcon: {
    fontSize: 20,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthTitle: {
    ...typography.display,
    color: colors.textPrimary,
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.small,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  gridCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...elevation.small,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  weekdayText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    width: 38,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDayCell: {
    width: '14.28%',
    height: 48,
  },
  dayCell: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  todayCell: {
    backgroundColor: colors.primary,
  },
  dayText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  todayText: {
    color: colors.surface,
    fontWeight: '800',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  dotPlaceholder: {
    height: 6,
  },
});
