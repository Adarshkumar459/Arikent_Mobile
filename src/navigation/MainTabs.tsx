import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeStack } from './stacks/HomeStack';
import { TasksStack } from './stacks/TasksStack';
import { ExpensesStack } from './stacks/ExpensesStack';
import { GoalsStack } from './stacks/GoalsStack';
import { CalendarStack } from './stacks/CalendarStack';
import { ProfileStack } from './stacks/ProfileStack';
import { BottomNavigation, TabItem } from '../components/navigation/BottomNavigation';
import { TabContext } from '../context/TabContext';
import { colors } from '../theme';

const TABS: TabItem[] = [
  { key: 'Home', label: 'Home', icon: '🏠' },
  { key: 'Tasks', label: 'Tasks', icon: '📋' },
  { key: 'Expenses', label: 'Expenses', icon: '💳' },
  { key: 'Goals', label: 'Goals', icon: '🎯' },
  { key: 'Calendar', label: 'Calendar', icon: '📅' },
  { key: 'Profile', label: 'Profile', icon: '👤' },
];

type TabKey = 'Home' | 'Tasks' | 'Expenses' | 'Goals' | 'Calendar' | 'Profile';

export const MainTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('Home');

  const switchTab = useCallback((tabKey: string) => {
    const key = tabKey as TabKey;
    setActiveTab(key);
  }, []);

  const renderStack = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeStack />;
      case 'Tasks':
        return <TasksStack />;
      case 'Expenses':
        return <ExpensesStack />;
      case 'Goals':
        return <GoalsStack />;
      case 'Calendar':
        return <CalendarStack />;
      case 'Profile':
        return <ProfileStack />;
      default:
        return <HomeStack />;
    }
  };

  return (
    <TabContext.Provider value={{ activeTab, switchTab }}>
      <View style={styles.root}>
        <View style={styles.content}>
          {renderStack()}
        </View>

        <BottomNavigation
          tabs={TABS}
          activeTab={activeTab}
          onTabPress={switchTab}
        />
      </View>
    </TabContext.Provider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
