import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoalsStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { CategoryChip } from '../../components/chips/CategoryChip';
import { GoalCard } from '../../components/cards/GoalCard';
import { GoalRepository } from '../../repositories/GoalRepository';
import { GoalItem, GoalCategory } from '../../services/api/goalApi';
import { GoalOptionsSheet } from '../../components/sheets/GoalOptionsSheet';
import { GoalLoadingScreen } from './GoalLoadingScreen';
import { GoalEmptyScreen } from './GoalEmptyScreen';
import { GoalErrorScreen } from './GoalErrorScreen';
import { useTabNav } from '../../context/TabContext';

type Props = NativeStackScreenProps<GoalsStackParamList, 'GoalList'>;

const CATEGORIES: Array<{ label: string; value?: GoalCategory }> = [
  { label: 'All' },
  { label: 'Learning', value: 'learning' },
  { label: 'Money', value: 'money' },
  { label: 'Health', value: 'health' },
  { label: 'Career', value: 'career' },
  { label: 'Personal', value: 'personal' },
  { label: 'Other', value: 'other' },
];

export const GoalsScreen: React.FC<Props> = ({ navigation }) => {
  const { switchTab } = useTabNav();
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected goal for options sheet
  const [activeGoal, setActiveGoal] = useState<GoalItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchGoals = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await GoalRepository.getGoals({
        category: selectedCategory,
      });
      setGoals(res.items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch goals');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGoals(goals.length === 0);
    });
    return unsubscribe;
  }, [navigation, selectedCategory]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchGoals(false);
  }, [selectedCategory]);

  const handleOpenSheet = (item: GoalItem) => {
    setActiveGoal(item);
    setIsSheetOpen(true);
  };

  const handleDeleteActiveGoal = async () => {
    if (!activeGoal) return;
    try {
      await GoalRepository.deleteGoal(activeGoal.id);
      setIsSheetOpen(false);
      fetchGoals(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete goal');
    }
  };

  if (isLoading && !isRefreshing) {
    return <GoalLoadingScreen />;
  }

  if (errorMsg && goals.length === 0) {
    return <GoalErrorScreen errorMessage={errorMsg} onRetry={() => fetchGoals(true)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="My Goals" onBackPress={() => switchTab('Home')} />

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.label}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <CategoryChip
              label={item.label}
              selected={selectedCategory === item.value}
              onPress={() => setSelectedCategory(item.value)}
            />
          )}
        />
      </View>

      {/* Goals List */}
      {goals.length === 0 ? (
        <GoalEmptyScreen />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('GoalDetails', { goalId: item.id })}
              onLongPress={() => handleOpenSheet(item)}
            >
              <GoalCard
                title={item.title}
                currentValue={item.currentValue}
                targetValue={item.targetValue}
                unit={item.unit}
                deadline={item.deadline ? new Date(item.deadline).toLocaleDateString() : undefined}
                category={item.category}
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Add Goal CTA */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddGoal')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Contextual Action Sheet */}
      <GoalOptionsSheet
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onEdit={() => {
          setIsSheetOpen(false);
          if (activeGoal) navigation.navigate('EditGoal', { goalId: activeGoal.id });
        }}
        onUpdateProgress={() => {
          setIsSheetOpen(false);
          if (activeGoal) navigation.navigate('UpdateGoalProgress', { goalId: activeGoal.id });
        }}
        onDelete={handleDeleteActiveGoal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoryContainer: {
    marginVertical: spacing.xs,
  },
  categoryList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
    gap: spacing.md,
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
