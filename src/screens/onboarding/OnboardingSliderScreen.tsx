import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { PrimaryButton } from '../../components/buttons';
import { OnboardingRepository } from '../../repositories/OnboardingRepository';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'organize' | 'tasks' | 'expenses' | 'goals' | 'plan';
}

const SLIDES: SlideItem[] = [
  {
    id: 'organize',
    title: 'Organize Your Life',
    subtitle: 'ARKIENT brings tasks, goals, expenses, reminders and important personal information together.',
    type: 'organize',
  },
  {
    id: 'tasks',
    title: 'Stay On Top of Tasks',
    subtitle: 'Manage your daily to-dos, set priorities, and never miss a deadline again.',
    type: 'tasks',
  },
  {
    id: 'expenses',
    title: 'Track Your Money',
    subtitle: 'Log expenses, categorize spending, and gain insights into your financial health.',
    type: 'expenses',
  },
  {
    id: 'goals',
    title: 'Achieve Your Goals',
    subtitle: 'Set ambitious milestones, track your progress, and celebrate your wins.',
    type: 'goals',
  },
  {
    id: 'plan',
    title: 'Plan Your Days',
    subtitle: 'Stay organized with an integrated calendar and timely reminders for everything that matters.',
    type: 'plan',
  },
];

type Props = NativeStackScreenProps<OnboardingStackParamList, any>;

export const OnboardingSliderScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  // Calculate safe top padding so header never hides behind status bar or camera notch
  const safeTopPadding = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 12) + spacing.xs;

  const handleFinishOnboarding = async () => {
    await OnboardingRepository.setOnboardingCompleted(true);
    navigation.navigate('Login' as never);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleFinishOnboarding();
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const scrollToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  // Render individual slide illustration
  const renderIllustration = (type: SlideItem['type']) => {
    switch (type) {
      case 'organize':
        return (
          <View style={styles.cardPedestal}>
            <View style={styles.badgeModuleIcon}>
              <Text style={styles.moduleEmoji}>✨</Text>
            </View>
            <Text style={styles.pedestalTitle}>ARKIENT OS</Text>
            <View style={styles.floatingModuleRow}>
              <View style={[styles.moduleChip, styles.moduleTasks]}>
                <Text style={styles.chipEmoji}>📋</Text>
                <Text style={styles.chipText}>Tasks & Priorities</Text>
              </View>
              <View style={[styles.moduleChip, styles.moduleGoals]}>
                <Text style={styles.chipEmoji}>🎯</Text>
                <Text style={styles.chipText}>Goals & Habits</Text>
              </View>
            </View>
            <View style={styles.floatingModuleRow}>
              <View style={[styles.moduleChip, styles.moduleExpenses]}>
                <Text style={styles.chipEmoji}>💰</Text>
                <Text style={styles.chipText}>Expense Tracking</Text>
              </View>
              <View style={[styles.moduleChip, styles.moduleCalendar]}>
                <Text style={styles.chipEmoji}>📅</Text>
                <Text style={styles.chipText}>Calendar Sync</Text>
              </View>
            </View>
          </View>
        );

      case 'tasks':
        return (
          <View style={styles.clipboardBase}>
            <View style={styles.clipboardClip} />
            <View style={styles.clipboardHeaderRow}>
              <View style={styles.clipboardTitlePill} />
              <View style={styles.badgeHigh}>
                <Text style={styles.badgeText}>HIGH</Text>
              </View>
            </View>
            <View style={styles.taskCardItem}>
              <View style={[styles.checkbox, styles.checkboxDone]}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
              <View style={styles.taskTextWrapper}>
                <Text style={styles.taskTitleDone}>Review Q3 Goal Roadmap</Text>
                <Text style={styles.taskTime}>Today • 10:00 AM</Text>
              </View>
            </View>
            <View style={styles.taskCardItem}>
              <View style={styles.checkbox}>
                <View style={styles.checkboxInner} />
              </View>
              <View style={styles.taskTextWrapper}>
                <Text style={styles.taskTitle}>Complete Weekly Expense Log</Text>
                <Text style={styles.taskTime}>Today • 4:30 PM</Text>
              </View>
            </View>
          </View>
        );

      case 'expenses':
        return (
          <View style={styles.chartContainer}>
            <View style={styles.statHeaderRow}>
              <View>
                <Text style={styles.statLabel}>MONTHLY SPENDING</Text>
                <Text style={styles.statValue}>$2,480.00</Text>
              </View>
              <View style={styles.trendBadge}>
                <Text style={styles.trendText}>↓ 12% saved</Text>
              </View>
            </View>
            <View style={styles.barsRow}>
              <View style={styles.barColWrapper}>
                <View style={[styles.barFill, { height: 40, backgroundColor: '#CABEFF' }]} />
                <Text style={styles.barDayText}>M</Text>
              </View>
              <View style={styles.barColWrapper}>
                <View style={[styles.barFill, { height: 65, backgroundColor: colors.primary }]} />
                <Text style={styles.barDayText}>T</Text>
              </View>
              <View style={styles.barColWrapper}>
                <View style={[styles.barFill, { height: 35, backgroundColor: '#CABEFF' }]} />
                <Text style={styles.barDayText}>W</Text>
              </View>
              <View style={styles.barColWrapper}>
                <View style={[styles.barFill, { height: 80, backgroundColor: colors.primary }]} />
                <Text style={styles.barDayText}>T</Text>
              </View>
              <View style={styles.barColWrapper}>
                <View style={[styles.barFill, { height: 50, backgroundColor: '#51DEAA' }]} />
                <Text style={styles.barDayText}>F</Text>
              </View>
            </View>
            <View style={styles.floatingExpenseItem}>
              <View style={styles.expenseCategoryIcon}>
                <Text style={{ fontSize: 14 }}>☕</Text>
              </View>
              <View style={styles.expenseMeta}>
                <Text style={styles.expenseTitle}>Coffee & Work</Text>
                <Text style={styles.expenseCategory}>Food & Drink</Text>
              </View>
              <Text style={styles.expenseAmount}>-$4.50</Text>
            </View>
          </View>
        );

      case 'goals':
        return (
          <View style={styles.targetCardContainer}>
            <View style={styles.outerRing}>
              <View style={styles.middleRing}>
                <View style={styles.innerTargetCore}>
                  <Text style={styles.targetIcon}>🎯</Text>
                </View>
              </View>
            </View>
            <View style={styles.goalInfoCard}>
              <View style={styles.goalHeaderRow}>
                <Text style={styles.goalTitle}>Quarterly Fitness Goal</Text>
                <Text style={styles.goalPercent}>75%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: '75%' }]} />
              </View>
              <View style={styles.milestoneRow}>
                <View style={styles.milestoneBadge}>
                  <Text style={styles.milestoneText}>🏁 12 of 16 Workouts</Text>
                </View>
                <Text style={styles.deadlineText}>14 days left</Text>
              </View>
            </View>
          </View>
        );

      case 'plan':
        return (
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeaderRow}>
              <Text style={styles.calendarMonthText}>AUGUST 2026</Text>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>📅 5 Events Today</Text>
              </View>
            </View>
            <View style={styles.calendarMiniGrid}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <Text key={idx} style={styles.gridDayHeader}>
                  {day}
                </Text>
              ))}
              {[10, 11, 12, 13, 14, 15, 16].map((dateNum) => (
                <View
                  key={dateNum}
                  style={[
                    styles.gridDateCell,
                    dateNum === 10 && styles.gridDateActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.gridDateText,
                      dateNum === 10 && styles.gridDateTextActive,
                    ]}
                  >
                    {dateNum}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.floatingReminderPill}>
              <View style={styles.bellIconBox}>
                <Text style={{ fontSize: 14 }}>🔔</Text>
              </View>
              <View style={styles.reminderMeta}>
                <Text style={styles.reminderTitle}>Team Sync & Review</Text>
                <Text style={styles.reminderTime}>10:00 AM • Room 4B</Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.screenWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent />

      {/* Ambient background lighting */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

      {/* Top Header with high-contrast Skip button */}
      <View style={[styles.header, { paddingTop: safeTopPadding }]}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleFinishOnboarding} activeOpacity={0.8}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Swipable FlatList Slider */}
      <View style={styles.sliderWrapper}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item }) => (
            <View style={[styles.slideCardContainer, { width: SCREEN_WIDTH }]}>
              {/* Illustration Card */}
              <View style={styles.illustrationArea}>
                {renderIllustration(item.type)}
              </View>

              {/* Title & Description */}
              <View style={styles.textArea}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
          )}
        />
      </View>

      {/* Bottom Controls (Progress Dots & Action Button) */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + spacing.sm, spacing.xl) }]}>
        {/* Progress Dots */}
        <View style={styles.progressRow}>
          {SLIDES.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => scrollToSlide(idx)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.dot,
                  idx === currentIndex ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <PrimaryButton
            title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next →'}
            onPress={handleNext}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(108, 76, 232, 0.08)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(96, 62, 212, 0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    zIndex: 999,
    elevation: 10,
  },
  stepBadge: {
    backgroundColor: '#F0EFFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#CABEFF',
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  skipBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    shadowColor: '#532DCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sliderWrapper: {
    flex: 1,
  },
  slideCardContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  illustrationArea: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },

  // 1. Organize Illustration
  cardPedestal: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E2E4',
    ...elevation.medium,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.12,
  },
  badgeModuleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0EFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  moduleEmoji: {
    fontSize: 22,
  },
  pedestalTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  floatingModuleRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  moduleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  moduleTasks: { backgroundColor: '#F0EFFF', borderColor: '#CABEFF' },
  moduleGoals: { backgroundColor: '#E8F8EE', borderColor: '#8FFFCF' },
  moduleExpenses: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  moduleCalendar: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  chipEmoji: { fontSize: 12, marginRight: 4 },
  chipText: { fontSize: 11, fontWeight: '600', color: '#1B1B1D' },

  // 2. Tasks Illustration
  clipboardBase: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E4E2E4',
    ...elevation.medium,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.12,
  },
  clipboardClip: {
    width: 56,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    marginTop: -20,
    marginBottom: spacing.md,
  },
  clipboardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clipboardTitlePill: { width: 100, height: 10, borderRadius: 5, backgroundColor: '#F0EDEF' },
  badgeHigh: { backgroundColor: '#FEE2E2', paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: radius.sm },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#BA1A1A' },
  taskCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCF8FB',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#F0EDEF',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  checkboxDone: { backgroundColor: colors.primary },
  checkboxInner: { width: 6, height: 6, borderRadius: 3 },
  checkMark: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  taskTextWrapper: { flex: 1 },
  taskTitle: { ...typography.bodySmall, fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  taskTitleDone: { ...typography.bodySmall, fontSize: 12, fontWeight: '600', color: colors.textSecondary, textDecorationLine: 'line-through' },
  taskTime: { ...typography.caption, fontSize: 10, color: colors.textMuted, marginTop: 1 },

  // 3. Expenses Illustration
  chartContainer: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E4E2E4',
    ...elevation.medium,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.12,
  },
  statHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  statLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 },
  statValue: { ...typography.heading2, fontSize: 20, color: colors.textPrimary, marginTop: 2 },
  trendBadge: { backgroundColor: '#E8F8EE', paddingHorizontal: spacing.xs, paddingVertical: 3, borderRadius: radius.full },
  trendText: { fontSize: 10, fontWeight: '700', color: '#007856' },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDEF',
  },
  barColWrapper: { alignItems: 'center', justifyContent: 'flex-end', width: 24 },
  barFill: { width: 12, borderRadius: 6 },
  barDayText: { fontSize: 9, fontWeight: '600', color: colors.textMuted, marginTop: 4 },
  floatingExpenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3F5',
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  expenseCategoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  expenseMeta: { flex: 1 },
  expenseTitle: { fontSize: 11, fontWeight: '600', color: colors.textPrimary },
  expenseCategory: { fontSize: 9, color: colors.textMuted },
  expenseAmount: { fontSize: 11, fontWeight: '700', color: '#BA1A1A' },

  // 4. Goals Illustration
  targetCardContainer: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E2E4',
    ...elevation.medium,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.12,
  },
  outerRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F4F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: '#CABEFF',
  },
  middleRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6DEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerTargetCore: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetIcon: { fontSize: 18 },
  goalInfoCard: {
    width: '100%',
    backgroundColor: '#FCF8FB',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#F0EDEF',
  },
  goalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  goalTitle: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  goalPercent: { fontSize: 12, fontWeight: '800', color: colors.primary },
  progressTrack: { height: 6, backgroundColor: '#E4E2E4', borderRadius: 3, overflow: 'hidden', marginBottom: spacing.xs },
  progressBar: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  milestoneRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  milestoneBadge: { backgroundColor: '#F0EFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  milestoneText: { fontSize: 9, fontWeight: '600', color: colors.primaryDark },
  deadlineText: { fontSize: 9, color: colors.textMuted },

  // 5. Plan Illustration
  calendarContainer: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E4E2E4',
    ...elevation.medium,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.12,
  },
  calendarHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  calendarMonthText: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 0.8 },
  eventBadge: { backgroundColor: '#F0EFFF', paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: radius.full },
  eventBadgeText: { fontSize: 9, fontWeight: '700', color: colors.primaryDark },
  calendarMiniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
    backgroundColor: '#FCF8FB',
    borderRadius: radius.md,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: '#F0EDEF',
  },
  gridDayHeader: { width: '13%', textAlign: 'center', fontSize: 9, fontWeight: '700', color: colors.textMuted, marginBottom: 2 },
  gridDateCell: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  gridDateActive: { backgroundColor: colors.primary },
  gridDateText: { fontSize: 10, fontWeight: '600', color: colors.textPrimary },
  gridDateTextActive: { color: '#FFFFFF', fontWeight: '700' },
  floatingReminderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3F5',
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  bellIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  reminderMeta: { flex: 1 },
  reminderTitle: { fontSize: 11, fontWeight: '600', color: colors.textPrimary },
  reminderTime: { fontSize: 9, color: colors.textMuted },

  // Text Section
  textArea: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading1,
    fontSize: 26,
    color: '#1B1B1D',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyLarge,
    fontSize: 15,
    color: '#484555',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 290,
  },

  // Bottom Controls
  bottomBar: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 32,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#E4E2E4',
  },
  actionContainer: {
    width: '100%',
  },
  actionBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
});
