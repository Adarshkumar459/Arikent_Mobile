import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TasksStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { PrimaryButton } from '../../components/buttons';
import { CategoryChip, PriorityChip, StatusChip } from '../../components/chips';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskFilter'>;

export const TaskFilterScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleReset = () => {
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSelectedCategory('All');
  };

  const handleApply = () => {
    navigation.navigate('TaskList', {
      status: selectedStatus !== 'All' ? selectedStatus.toLowerCase() : undefined,
      priority: selectedPriority !== 'All' ? selectedPriority.toLowerCase() : undefined,
      category: selectedCategory !== 'All' ? selectedCategory.toLowerCase() : undefined,
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Filter Tasks"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATUS</Text>
          <View style={styles.chipRow}>
            {['All', 'Pending', 'In Progress', 'Completed'].map((st) => (
              <StatusChip
                key={st}
                status={st as any}
                selected={selectedStatus === st}
                onPress={() => setSelectedStatus(st)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIORITY</Text>
          <View style={styles.chipRow}>
            {['All', 'High', 'Medium', 'Low'].map((pr) => (
              <PriorityChip
                key={pr}
                priority={pr as any}
                selected={selectedPriority === pr}
                onPress={() => setSelectedPriority(pr)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CATEGORY</Text>
          <View style={styles.chipRow}>
            {['All', 'Personal', 'Work', 'Home', 'Finance', 'Health', 'Other'].map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Apply Filters" onPress={handleApply} />
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
  resetText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actions: {
    marginTop: spacing.md,
  },
});
