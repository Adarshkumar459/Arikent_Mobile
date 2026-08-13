import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';

export interface DatePickerModalProps {
  visible: boolean;
  initialDate?: string; // YYYY-MM-DD format
  onConfirm: (selectedDateISO: string, formattedYYYYMMDD: string) => void;
  onCancel: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const YEARS_RANGE = Array.from({ length: 21 }, (_, i) => 2018 + i); // 2018 to 2038

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  initialDate,
  onConfirm,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (initialDate) {
      const parsed = new Date(initialDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  const [viewDate, setViewDate] = useState<Date>(() => selectedDate);
  const [viewMode, setViewMode] = useState<'calendar' | 'year' | 'month'>('calendar');

  useEffect(() => {
    if (visible) {
      let d = new Date();
      if (initialDate) {
        const parsed = new Date(initialDate);
        if (!isNaN(parsed.getTime())) d = parsed;
      }
      setSelectedDate(d);
      setViewDate(d);
      setViewMode('calendar');
    }
  }, [visible, initialDate]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const newSelected = new Date(currentYear, currentMonth, day);
    setSelectedDate(newSelected);
  };

  const handleSelectYear = (year: number) => {
    setViewDate(new Date(year, currentMonth, 1));
    setViewMode('calendar');
  };

  const handleSelectMonth = (monthIndex: number) => {
    setViewDate(new Date(currentYear, monthIndex, 1));
    setViewMode('calendar');
  };

  const handleConfirm = () => {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    onConfirm(selectedDate.toISOString(), formatted);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewDate(today);
    setViewMode('calendar');
  };

  // Generate grid days for current month view
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const todayDate = new Date();
  const isTodayMonth = todayDate.getFullYear() === currentYear && todayDate.getMonth() === currentMonth;
  const isSelectedMonth = selectedDate.getFullYear() === currentYear && selectedDate.getMonth() === currentMonth;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              {/* Top Banner / Selection Display */}
              <View style={styles.bannerHeader}>
                <TouchableOpacity onPress={handleToday} activeOpacity={0.8}>
                  <Text style={styles.bannerSubtext}>
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                </TouchableOpacity>

                {/* Mode Selector (Click to switch to Year or Month mode) */}
                <View style={styles.bannerNavRow}>
                  <TouchableOpacity
                    style={styles.yearMonthToggleBtn}
                    onPress={() => setViewMode(viewMode === 'calendar' ? 'year' : 'calendar')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.bannerTitle}>
                      {MONTH_NAMES[currentMonth]} {currentYear}
                    </Text>
                    <Text style={styles.toggleArrow}>
                      {viewMode === 'calendar' ? '▼' : '▲'}
                    </Text>
                  </TouchableOpacity>

                  {viewMode === 'calendar' && (
                    <View style={styles.monthArrowsRow}>
                      <TouchableOpacity style={styles.arrowNavBtn} onPress={handlePrevMonth}>
                        <Text style={styles.arrowNavText}>‹</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.arrowNavBtn} onPress={handleNextMonth}>
                        <Text style={styles.arrowNavText}>›</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* View Mode Switching */}
              {viewMode === 'year' && (
                <View style={styles.yearMonthPickerContainer}>
                  <Text style={styles.pickerSectionLabel}>Select Year</Text>
                  <ScrollView style={styles.yearScrollView} contentContainerStyle={styles.yearGrid}>
                    {YEARS_RANGE.map((yr) => {
                      const isCurrYear = yr === currentYear;
                      return (
                        <TouchableOpacity
                          key={yr}
                          style={[styles.yearItem, isCurrYear && styles.activeYearItem]}
                          onPress={() => handleSelectYear(yr)}
                        >
                          <Text style={[styles.yearText, isCurrYear && styles.activeYearText]}>
                            {yr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <Text style={styles.pickerSectionLabel}>Select Month</Text>
                  <View style={styles.monthGrid}>
                    {MONTH_NAMES.map((mName, idx) => {
                      const isCurrMonth = idx === currentMonth;
                      return (
                        <TouchableOpacity
                          key={mName}
                          style={[styles.monthItem, isCurrMonth && styles.activeMonthItem]}
                          onPress={() => handleSelectMonth(idx)}
                        >
                          <Text style={[styles.monthText, isCurrMonth && styles.activeMonthText]}>
                            {mName.slice(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {viewMode === 'calendar' && (
                <View style={styles.calendarContainer}>
                  {/* Weekday Headers */}
                  <View style={styles.weekdaysRow}>
                    {SHORT_WEEKDAYS.map((wd) => (
                      <Text key={wd} style={styles.weekdayText}>
                        {wd}
                      </Text>
                    ))}
                  </View>

                  {/* Days Grid */}
                  <View style={styles.daysGrid}>
                    {/* Padding days from prev month */}
                    {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
                      const prevDay = daysInPrevMonth - firstDayOfWeek + idx + 1;
                      return (
                        <View key={`prev-${idx}`} style={styles.dayCell}>
                          <Text style={styles.paddingDayText}>{prevDay}</Text>
                        </View>
                      );
                    })}

                    {/* Current month days */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const isSelected = isSelectedMonth && selectedDate.getDate() === dayNum;
                      const isToday = isTodayMonth && todayDate.getDate() === dayNum;

                      return (
                        <TouchableOpacity
                          key={`day-${dayNum}`}
                          style={[
                            styles.dayCell,
                            isToday && !isSelected && styles.todayCell,
                            isSelected && styles.selectedDayCell,
                          ]}
                          onPress={() => handleSelectDay(dayNum)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              isToday && styles.todayDayText,
                              isSelected && styles.selectedDayText,
                            ]}
                          >
                            {dayNum}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Bottom Actions Row */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.todayShortcutBtn} onPress={handleToday}>
                  <Text style={styles.todayShortcutText}>Today</Text>
                </TouchableOpacity>

                <View style={styles.rightActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
                    <Text style={styles.confirmText}>Select</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 27, 29, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    overflow: 'hidden',
    ...elevation.large,
  },
  bannerHeader: {
    backgroundColor: colors.primaryContainer,
    padding: spacing.lg,
    gap: 4,
  },
  bannerSubtext: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: colors.onPrimaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bannerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  yearMonthToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerTitle: {
    ...typography.heading2,
    fontSize: 20,
    color: colors.textLight,
  },
  toggleArrow: {
    fontSize: 10,
    color: colors.textLight,
  },
  monthArrowsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowNavBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowNavText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
    marginTop: -2,
  },
  calendarContainer: {
    padding: spacing.md,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: colors.outline,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
    marginVertical: 2,
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: colors.primaryContainer,
  },
  selectedDayCell: {
    backgroundColor: colors.primaryContainer,
  },
  dayText: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurface,
  },
  todayDayText: {
    fontWeight: '700',
    color: colors.primaryContainer,
  },
  selectedDayText: {
    fontWeight: '700',
    color: colors.textLight,
  },
  paddingDayText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.outlineVariant,
  },
  yearMonthPickerContainer: {
    padding: spacing.md,
    maxHeight: 280,
  },
  pickerSectionLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.outline,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  yearScrollView: {
    maxHeight: 110,
    marginBottom: spacing.md,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  yearItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  activeYearItem: {
    backgroundColor: colors.primaryContainer,
  },
  yearText: {
    ...typography.body,
    fontSize: 13,
    color: colors.onSurface,
  },
  activeYearText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthItem: {
    width: '23%',
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
  },
  activeMonthItem: {
    backgroundColor: colors.primaryContainer,
  },
  monthText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.onSurface,
  },
  activeMonthText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  todayShortcutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  todayShortcutText: {
    ...typography.heading4,
    fontSize: 14,
    color: colors.primary,
  },
  rightActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  cancelText: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  confirmBtn: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: 10,
  },
  confirmText: {
    ...typography.heading4,
    fontSize: 14,
    color: colors.textLight,
  },
});
