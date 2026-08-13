import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';

export interface ExpenseCardProps {
  title?: string;
  category: string;
  amount: number;
  type?: 'expense' | 'income';
  date?: string;
  time?: string;
  paymentMethod?: string;
  notes?: string;
  onPress?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  title,
  category,
  amount,
  type = 'expense',
  date,
  time,
  paymentMethod,
  notes,
  onPress,
}) => {
  const catLower = (category || 'other').toLowerCase();

  // Pick category color & icon symbol with explicit string typing
  let accentColor: string = colors.primaryContainer;
  let iconBg: string = colors.onPrimaryContainer;
  let iconSymbol: string = '🛍️';

  if (catLower.includes('food') || catLower.includes('restaurant') || catLower.includes('dining')) {
    accentColor = colors.tertiaryContainer;
    iconBg = '#E8F8F0';
    iconSymbol = '🍽️';
  } else if (catLower.includes('transport') || catLower.includes('cab') || catLower.includes('travel') || catLower.includes('ride') || catLower.includes('uber')) {
    accentColor = colors.secondaryContainer;
    iconBg = colors.primaryLight;
    iconSymbol = '🚗';
  } else if (catLower.includes('shopping')) {
    accentColor = colors.primaryContainer;
    iconBg = colors.onPrimaryContainer;
    iconSymbol = '🛍️';
  } else if (catLower.includes('bill') || catLower.includes('utility') || catLower.includes('electricity')) {
    accentColor = '#D97706';
    iconBg = '#FEF3C7';
    iconSymbol = '🧾';
  } else if (catLower.includes('health') || catLower.includes('medical')) {
    accentColor = colors.tertiary;
    iconBg = '#E6F4EA';
    iconSymbol = '💊';
  }

  const isIncome = type === 'income';
  const displayTitle = title || notes || category.toUpperCase();

  const metaParts: string[] = [];
  if (category) metaParts.push(category.charAt(0).toUpperCase() + category.slice(1));
  if (paymentMethod) metaParts.push(paymentMethod);
  if (time) metaParts.push(time);
  else if (date) metaParts.push(date);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Left Vertical Category Line */}
      <View style={[styles.accentLine, { backgroundColor: accentColor }]} />

      <View style={styles.mainContainer}>
        {/* Icon Circle */}
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Text style={styles.iconSymbol}>{iconSymbol}</Text>
        </View>

        {/* Info Stack */}
        <View style={styles.infoStack}>
          <Text style={styles.title} numberOfLines={1}>
            {displayTitle}
          </Text>
          <Text style={styles.metaText} numberOfLines={1}>
            {metaParts.join(' • ')}
          </Text>
        </View>

        {/* Amount Text */}
        <Text style={[styles.amountText, isIncome && styles.incomeText]}>
          {isIncome ? '+' : '-'}₹{amount.toLocaleString('en-IN')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...elevation.small,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingLeft: spacing.md + 4,
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSymbol: {
    fontSize: 18,
  },
  infoStack: {
    flex: 1,
  },
  title: {
    ...typography.heading4,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 2,
  },
  metaText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.outline,
  },
  amountText: {
    ...typography.heading3,
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  incomeText: {
    color: colors.tertiaryContainer,
  },
});
