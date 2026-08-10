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
import { TasksStackParamList } from '../../navigation/types/navigation.types';
import { colors, spacing, typography, radius, elevation } from '../../theme';
import { ScreenHeader } from '../../components/navigation/ScreenHeader';
import { SearchInput } from '../../components/inputs/SearchInput';
import { CategoryChip } from '../../components/chips/CategoryChip';
import { TaskCard } from '../../components/cards/TaskCard';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskItem, TaskCategory, TaskPriority, TaskStatus } from '../../services/api/taskApi';
import { TaskOptionsSheet } from '../../components/sheets/TaskOptionsSheet';
import { TaskLoadingScreen } from './TaskLoadingScreen';
import { TaskEmptyScreen } from './TaskEmptyScreen';
import { TaskErrorScreen } from './TaskErrorScreen';
import { useTabNav } from '../../context/TabContext';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskList'>;

const CATEGORIES: Array<{ label: string; value?: TaskCategory }> = [
  { label: 'All' },
  { label: 'Personal', value: 'personal' },
  { label: 'Work', value: 'work' },
  { label: 'Home', value: 'home' },
  { label: 'Finance', value: 'finance' },
  { label: 'Health', value: 'health' },
  { label: 'Other', value: 'other' },
];

export const TaskListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { switchTab } = useTabNav();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected task for options sheet
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchTasks = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await TaskRepository.getTasks({
        category: selectedCategory,
        priority: selectedPriority,
        status: selectedStatus,
      });
      setTasks(res.items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks(tasks.length === 0);
    });
    return unsubscribe;
  }, [navigation, selectedCategory, selectedPriority, selectedStatus]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTasks(false);
  }, [selectedCategory, selectedPriority, selectedStatus]);

  const handleToggleComplete = async (task: TaskItem) => {
    try {
      if (task.status === 'completed') {
        await TaskRepository.updateTask(task.id, { status: 'pending' });
      } else {
        await TaskRepository.completeTask(task.id);
      }
      fetchTasks(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update task');
    }
  };

  const handleOpenSheet = (task: TaskItem) => {
    setActiveTask(task);
    setIsSheetOpen(true);
  };

  const handleDeleteActiveTask = async () => {
    if (!activeTask) return;
    try {
      await TaskRepository.deleteTask(activeTask.id);
      setIsSheetOpen(false);
      fetchTasks(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete task');
    }
  };

  const handleDuplicateActiveTask = async () => {
    if (!activeTask) return;
    try {
      await TaskRepository.createTask({
        title: `${activeTask.title} (Copy)`,
        description: activeTask.description,
        category: activeTask.category,
        priority: activeTask.priority,
        dueDate: activeTask.dueDate,
      });
      setIsSheetOpen(false);
      fetchTasks(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to duplicate task');
    }
  };

  // Search filtering
  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
  });

  if (isLoading && !isRefreshing) {
    return <TaskLoadingScreen />;
  }

  if (errorMsg && tasks.length === 0) {
    return <TaskErrorScreen errorMessage={errorMsg} onRetry={() => fetchTasks(true)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="My Tasks"
        onBackPress={() => switchTab('Home')}
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('TaskFilter')}>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrapper}>
        <SearchInput
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      </View>

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

      {/* Main Task List */}
      {filteredTasks.length === 0 ? (
        <TaskEmptyScreen />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
              onLongPress={() => handleOpenSheet(item)}
            >
              <TaskCard
                title={item.title}
                description={item.description}
                completed={item.status === 'completed'}
                priority={item.priority}
                category={item.category}
                dueDate={item.dueDate ? new Date(item.dueDate).toLocaleDateString() : undefined}
                onToggle={() => handleToggleComplete(item)}
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Add Task CTA */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Contextual Action Sheet */}
      <TaskOptionsSheet
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onEdit={() => {
          setIsSheetOpen(false);
          if (activeTask) navigation.navigate('EditTask', { taskId: activeTask.id });
        }}
        onDuplicate={handleDuplicateActiveTask}
        onMarkCompleted={() => {
          setIsSheetOpen(false);
          if (activeTask) handleToggleComplete(activeTask);
        }}
        onDelete={handleDeleteActiveTask}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterIcon: {
    fontSize: 20,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  categoryContainer: {
    marginBottom: spacing.sm,
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
