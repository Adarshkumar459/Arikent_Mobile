import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { ExpenseRepository } from '../../repositories/ExpenseRepository';
import { ExpenseItem } from '../../services/api/expenseApi';
import { DatePickerModal } from '../../components/modals/DatePickerModal';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'ExpenseAnalytics'>;

// Distinct, vibrant color palette for every category
const CATEGORY_COLORS: Record<string, string> = {
  food: '#FF6B6B',          // Vibrant Coral Red/Orange
  shopping: '#6C4CE8',      // Deep Royal Purple
  travel: '#3B82F6',        // Electric Blue
  bills: '#10B981',         // Emerald Green
  health: '#EC4899',        // Hot Pink
  education: '#F59E0B',     // Amber Gold
  entertainment: '#8B5CF6', // Vivid Violet
  other: '#14B8A6',         // Bright Teal
};

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️',
  shopping: '🛍️',
  travel: '🚗',
  bills: '🧾',
  health: '💊',
  education: '📚',
  entertainment: '🎬',
  other: '💳',
};

// 100% Plain, Solid, Continuous Multi-Color Donut Ring (No Dots, No Gaps)
const SolidContinuousDonutChart: React.FC<{
  breakdown: Array<{ categoryKey: string; category: string; amount: number; percentage: number; color: string }>;
  topCategoryName: string;
  topCategoryColor: string;
  size?: number;
  strokeWidth?: number;
}> = ({ breakdown, topCategoryName, topCategoryColor, size = 140, strokeWidth = 14 }) => {
  const TOTAL_DEGREES = 360;
  const radiusVal = size / 2;
  const ringRadius = radiusVal - strokeWidth / 2;

  // Build 360 degree color map for 100% solid continuous ring
  const degreeColors: string[] = [];

  if (breakdown.length === 0) {
    for (let deg = 0; deg < TOTAL_DEGREES; deg++) {
      degreeColors.push(colors.surfaceContainerLow);
    }
  } else {
    let currentCategoryIdx = 0;
    let accumulatedPercentage = 0;

    for (let deg = 0; deg < TOTAL_DEGREES; deg++) {
      const currentPercentThreshold = (deg / TOTAL_DEGREES) * 100;

      while (
        currentCategoryIdx < breakdown.length - 1 &&
        currentPercentThreshold >= accumulatedPercentage + breakdown[currentCategoryIdx].percentage
      ) {
        accumulatedPercentage += breakdown[currentCategoryIdx].percentage;
        currentCategoryIdx++;
      }

      degreeColors.push(breakdown[currentCategoryIdx]?.color || topCategoryColor);
    }
  }

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* 360 overlapping hairline bars forming a 100% solid continuous smooth ring */}
      {degreeColors.map((segColor, deg) => {
        const angleRad = ((deg - 90) * Math.PI) / 180;
        const x = radiusVal + ringRadius * Math.cos(angleRad) - strokeWidth / 2;
        const y = radiusVal + ringRadius * Math.sin(angleRad) - strokeWidth / 2;

        return (
          <View
            key={`deg-${deg}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: strokeWidth,
              height: strokeWidth + 2,
              backgroundColor: segColor,
              transform: [{ rotate: `${deg}deg` }],
            }}
          />
        );
      })}

      {/* Donut Center Hole */}
      <View
        style={{
          width: size - strokeWidth * 2 - 4,
          height: size - strokeWidth * 2 - 4,
          borderRadius: (size - strokeWidth * 2 - 4) / 2,
          backgroundColor: colors.surfaceContainerLowest,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 3,
        }}
      >
        <Text style={styles.chartTopLabel}>Top Category</Text>
        <Text style={[styles.chartTopVal, { color: topCategoryColor }]} numberOfLines={1}>
          {topCategoryName}
        </Text>
      </View>
    </View>
  );
};

export const ExpenseAnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  // Default to August 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 7, 1));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const res = await ExpenseRepository.getExpenses();
      setExpenses(res.items);
    } catch (err: any) {
      console.log('Error fetching expenses for analytics:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handlePrevMonth = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const currentMonthFormatted = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Filter expenses by selected month & year
  const filteredExpenses = expenses.filter((item) => {
    if (!item.date) return true;
    const itemDate = new Date(item.date);
    return (
      itemDate.getMonth() === selectedDate.getMonth() &&
      itemDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // 1. Dynamic Total Spent & Counts for selected month
  const totalSpent = filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const transactionCount = filteredExpenses.length;
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const dailyAverage = Math.round(totalSpent / daysInMonth);

  // 2. Dynamic Category Breakdown Computation
  const categoryTotals: Record<string, number> = {};
  filteredExpenses.forEach((item) => {
    const cat = (item.category || 'other').toLowerCase();
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (item.amount || 0);
  });

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([catKey, sumAmount]) => {
      const formattedCat = catKey.charAt(0).toUpperCase() + catKey.slice(1);
      const percentage = totalSpent > 0 ? Math.round((sumAmount / totalSpent) * 100) : 0;
      const color = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.other;
      return {
        categoryKey: catKey,
        category: formattedCat,
        amount: sumAmount,
        percentage,
        color,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const topCategoryObj = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;
  const topCategoryName = topCategoryObj ? topCategoryObj.category : 'None';
  const topCategoryColor = topCategoryObj ? topCategoryObj.color : colors.primaryContainer;

  // 3. Dynamic Top Spending Items
  const topSpendingItems = [...filteredExpenses]
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ScreenHeader matching Goal & Calendar pages SAME TO SAME */}
      <ScreenHeader
        title="Spending Analytics"
        rightAction={
          <TouchableOpacity
            onPress={fetchAnalyticsData}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: 16 }}>🔄</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header & Month Selector */}
          <View style={styles.monthHeaderSection}>
            <Text style={styles.pageTitle}>Overview</Text>

            <View style={styles.monthSelectorBar}>
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={handlePrevMonth}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.arrowIcon}>‹</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.monthTitleRow}
                onPress={() => setIsDatePickerOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.calendarIcon}>📅</Text>
                <Text style={styles.monthText}>{currentMonthFormatted}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.arrowButton}
                onPress={handleNextMonth}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dynamic Total Spent Summary Card */}
          <View style={styles.totalCard}>
            <View style={styles.totalAccentLine} />
            <Text style={styles.totalCaption}>TOTAL SPENT</Text>
            <Text style={styles.totalAmount}>₹{totalSpent.toLocaleString('en-IN')}</Text>

            <View style={styles.statsDivider} />

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Transactions</Text>
                <Text style={styles.statVal}>{transactionCount} Expenses</Text>
              </View>

              <View style={styles.vertDivider} />

              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Daily Average</Text>
                <Text style={styles.statVal}>₹{dailyAverage.toLocaleString('en-IN')} / day</Text>
              </View>
            </View>
          </View>

          {/* Dynamic Category Breakdown */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>

            <View style={styles.breakdownCard}>
              {/* Donut Chart Visual with 100% Solid Continuous Plain Multi-Color Ring */}
              <View style={styles.chartVisualWrapper}>
                <SolidContinuousDonutChart
                  breakdown={categoryBreakdown}
                  topCategoryName={topCategoryName}
                  topCategoryColor={topCategoryColor}
                  size={140}
                  strokeWidth={14}
                />
              </View>

              {/* Breakdown List with Distinct Category Colors */}
              <View style={styles.breakdownList}>
                {categoryBreakdown.length === 0 ? (
                  <Text style={styles.emptyText}>No category data available for {currentMonthFormatted}</Text>
                ) : (
                  categoryBreakdown.map((item) => (
                    <View key={item.categoryKey} style={styles.breakdownItem}>
                      <View style={styles.itemLeft}>
                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                        <Text style={styles.itemCategory}>{item.category}</Text>
                      </View>

                      <View style={styles.itemRight}>
                        <Text style={styles.itemAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                        <View style={[styles.percentageBadge, { backgroundColor: item.color + '1A' }]}>
                          <Text style={[styles.percentageText, { color: item.color }]}>{item.percentage}%</Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>

          {/* Dynamic Top Spending Items */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Top Spending</Text>

            <View style={styles.topSpendingList}>
              {topSpendingItems.length === 0 ? (
                <Text style={styles.emptyText}>No spending records logged for {currentMonthFormatted}</Text>
              ) : (
                topSpendingItems.map((item) => {
                  const catKey = (item.category || 'other').toLowerCase();
                  const icon = CATEGORY_ICONS[catKey] || '💳';
                  const itemColor = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.other;
                  const formattedDate = item.date
                    ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Recent';
                  const displayTitle = item.note || item.category.toUpperCase();

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.topItemCard}
                      onPress={() => navigation.navigate('ExpenseDetails', { expenseId: item.id })}
                      activeOpacity={0.85}
                    >
                      <View style={styles.topItemLeft}>
                        <View style={[styles.topItemIconCircle, { backgroundColor: itemColor + '20' }]}>
                          <Text style={styles.topItemEmoji}>{icon}</Text>
                        </View>
                        <View>
                          <Text style={styles.topItemTitle} numberOfLines={1}>
                            {displayTitle}
                          </Text>
                          <Text style={styles.topItemSubtitle}>
                            {formattedDate} • {item.category}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.topItemAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Date Picker Modal for month & year selection */}
      <DatePickerModal
        visible={isDatePickerOpen}
        initialDate={selectedDate.toISOString()}
        onConfirm={(iso) => {
          setSelectedDate(new Date(iso));
          setIsDatePickerOpen(false);
        }}
        onCancel={() => setIsDatePickerOpen(false)}
      />
    </SafeAreaView>
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
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: 60,
  },
  monthHeaderSection: {
    gap: spacing.sm,
  },
  pageTitle: {
    ...typography.heading1,
    fontSize: 24,
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
    paddingVertical: 6,
  },
  arrowButton: {
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  calendarIcon: {
    fontSize: 15,
  },
  monthText: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: '600',
  },
  totalCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...elevation.small,
  },
  totalAccentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primaryContainer,
  },
  totalCaption: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.outline,
    letterSpacing: 1,
    marginBottom: 4,
  },
  totalAmount: {
    ...typography.display,
    fontSize: 32,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  statsDivider: {
    height: 1,
    backgroundColor: colors.surfaceContainerHighest,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.outline,
  },
  statVal: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.onSurface,
    marginTop: 2,
  },
  vertDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.surfaceContainerHighest,
    marginHorizontal: spacing.md,
  },
  sectionContainer: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.onSurface,
  },
  breakdownCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    gap: spacing.lg,
    ...elevation.small,
  },
  chartVisualWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  chartTopLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.outline,
  },
  chartTopVal: {
    ...typography.heading3,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  breakdownList: {
    gap: spacing.xs,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: spacing.xs,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
  },
  itemCategory: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurface,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemAmount: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    minWidth: 44,
    alignItems: 'center',
  },
  percentageText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  topSpendingList: {
    gap: spacing.sm,
  },
  topItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...elevation.small,
  },
  topItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  topItemIconCircle: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topItemEmoji: {
    fontSize: 18,
  },
  topItemTitle: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.onSurface,
  },
  topItemSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.outline,
    marginTop: 2,
  },
  topItemAmount: {
    ...typography.heading4,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.outline,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
