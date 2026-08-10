import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeStack } from './stacks/HomeStack';
import { TasksStack } from './stacks/TasksStack';
import { ExpensesStack } from './stacks/ExpensesStack';
import { GoalsStack } from './stacks/GoalsStack';
import { CalendarStack } from './stacks/CalendarStack';
import { ProfileStack } from './stacks/ProfileStack';
import { BottomNavigation, TabItem } from '../components/navigation/BottomNavigation';
import { colors } from '../theme';

const TABS: TabItem[] = [
  { key: 'Home', label: 'Home', icon: '🏠' },
  { key: 'Tasks', label: 'Tasks', icon: '📋' },
  { key: 'Expenses', label: 'Expenses', icon: '💳' },
  { key: 'Goals', label: 'Goals', icon: '🎯' },
  { key: 'Calendar', label: 'Calendar', icon: '📅' },
  { key: 'Profile', label: 'More', icon: '•••' },
];

export const MainTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Home');
  const [homeStackKey, setHomeStackKey] = useState<number>(0);

  const handleTabPress = (tabKey: string) => {
    if (tabKey === 'Home') {
      // Force HomeStack to reset to its root Home Dashboard screen
      setHomeStackKey((prev) => prev + 1);
    }
    setActiveTab(tabKey);
  };

  const renderActiveStack = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeStack key={`home-stack-${homeStackKey}`} />;
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
        return <HomeStack key={`home-stack-${homeStackKey}`} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderActiveStack()}</View>
      <BottomNavigation tabs={TABS} activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
});
