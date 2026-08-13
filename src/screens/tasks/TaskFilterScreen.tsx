import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TasksStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskFilter'>;

export const TaskFilterScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('Medium');
  const [selectedSort, setSelectedSort] = useState<string>('Due Date — Earliest');

  const handleReset = () => {
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedPriority('Medium');
    setSelectedSort('Due Date — Earliest');
  };

  const handleApply = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ScreenHeader matching Task, Expense & Goal pages SAME TO SAME */}
      <ScreenHeader
        title="Filter & Sort"
        rightAction={
          <TouchableOpacity
            onPress={handleReset}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.resetHeaderText}>Reset</Text>
          </TouchableOpacity>
        }
      />

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* STATUS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>STATUS</Text>
          <View style={styles.chipsRow}>
            {['All', 'Pending', 'In Progress', 'Completed'].map((st) => {
              const active = selectedStatus === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedStatus(st)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{st}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CATEGORY */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>CATEGORY</Text>
          <View style={styles.chipsRow}>
            {['All', 'Personal', 'Work', 'Home', 'Finance', 'Health', 'Other'].map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* PRIORITY */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PRIORITY</Text>
          <View style={styles.chipsRow}>
            {['Low', 'Medium', 'High'].map((pri) => {
              const active = selectedPriority === pri;
              return (
                <TouchableOpacity
                  key={pri}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedPriority(pri)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{pri}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SORT BY */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SORT BY</Text>
          <View style={styles.radioList}>
            {[
              'Due Date — Earliest',
              'Due Date — Latest',
              'Priority — High to Low',
              'Recently Created',
            ].map((option) => {
              const active = selectedSort === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => setSelectedSort(option)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.radioText, active && styles.radioTextActive]}>
                    {option}
                  </Text>
                  <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                    {active && <View style={styles.innerDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.85}>
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  resetHeaderText: {
    ...typography.caption,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: 40,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
  },
  chipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: colors.textLight,
    fontWeight: '600',
  },
  radioList: {
    gap: spacing.xs,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  radioText: {
    ...typography.body,
    fontSize: 15,
    color: colors.onSurface,
  },
  radioTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  resetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resetText: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.primary,
  },
  applyButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.small,
  },
  applyText: {
    ...typography.heading4,
    fontSize: 15,
    color: colors.textLight,
  },
});
