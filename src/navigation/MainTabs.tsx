import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  createNavigatorFactory,
  useNavigationBuilder,
  TabRouter,
  TabActions,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import { HomeStack } from './stacks/HomeStack';
import { TasksStack } from './stacks/TasksStack';
import { ExpensesStack } from './stacks/ExpensesStack';
import { GoalsStack } from './stacks/GoalsStack';
import { NotesStack } from './stacks/NotesStack';
import { CalendarStack } from './stacks/CalendarStack';
import { ProfileStack } from './stacks/ProfileStack';
import { BottomNavigation, TabItem } from '../components/navigation/BottomNavigation';
import { TabContext } from '../context/TabContext';
import { colors } from '../theme';

const TABS: TabItem[] = [
  { key: 'HomeTab', label: 'Home', icon: '🏠' },
  { key: 'TasksTab', label: 'Tasks', icon: '📋' },
  { key: 'ExpensesTab', label: 'Expenses', icon: '💳' },
  { key: 'GoalsTab', label: 'Goals', icon: '🎯' },
  { key: 'NotesTab', label: 'Notes', icon: '📝' },
  { key: 'CalendarTab', label: 'Calendar', icon: '📅' },
];

/**
 * Root route names of each tab stack where the bottom navigation bar MUST be shown.
 * On all other nested detail/sub screens, the bottom navigation bar is automatically hidden.
 */
const ROOT_TAB_ROUTES: Record<string, string> = {
  HomeTab: 'Dashboard',
  TasksTab: 'TaskList',
  ExpensesTab: 'ExpenseList',
  GoalsTab: 'GoalList',
  NotesTab: 'NoteList',
  CalendarTab: 'Calendar',
  ProfileTab: 'Profile',
};

function shouldShowBottomNav(activeRoute: any): boolean {
  const focusedRouteName = getFocusedRouteNameFromRoute(activeRoute);
  const expectedRootName = ROOT_TAB_ROUTES[activeRoute.name];

  // If focusedRouteName is undefined, it means navigation is at the stack's initial root screen
  if (!focusedRouteName || focusedRouteName === expectedRootName) {
    return true;
  }

  // Any other route inside a stack means the user is on a detail/sub screen -> hide bottom nav
  return false;
}

function TabNavigator({ initialRouteName, children, screenOptions }: any) {
  const { state, navigation, descriptors, NavigationContent } = useNavigationBuilder(TabRouter, {
    children,
    screenOptions,
    initialRouteName,
  });

  const activeRoute = state.routes[state.index];
  const activeTabKey = activeRoute.name;
  const isTabBarVisible = shouldShowBottomNav(activeRoute);

  const handleTabPress = (tabKey: string) => {
    let targetRoute = tabKey;
    if (tabKey === 'Home') targetRoute = 'HomeTab';
    if (tabKey === 'Tasks') targetRoute = 'TasksTab';
    if (tabKey === 'Expenses') targetRoute = 'ExpensesTab';
    if (tabKey === 'Goals') targetRoute = 'GoalsTab';
    if (tabKey === 'Notes') targetRoute = 'NotesTab';
    if (tabKey === 'Calendar') targetRoute = 'CalendarTab';
    if (tabKey === 'Profile') targetRoute = 'ProfileTab';

    navigation.dispatch({
      ...TabActions.jumpTo(targetRoute),
      target: state.key,
    });
  };

  return (
    <TabContext.Provider
      value={{
        activeTab: activeTabKey,
        resetSignal: 0,
        switchTab: handleTabPress,
      }}
    >
      <NavigationContent>
        <View style={styles.root}>
          <View style={styles.content}>
            {state.routes.map((route, i) => {
              const descriptor = descriptors[route.key];
              const isFocused = state.index === i;
              return (
                <View
                  key={route.key}
                  style={[StyleSheet.absoluteFill, { display: isFocused ? 'flex' : 'none' }]}
                >
                  {descriptor.render()}
                </View>
              );
            })}
          </View>

          {isTabBarVisible && (
            <BottomNavigation
              tabs={TABS}
              activeTab={activeTabKey}
              onTabPress={handleTabPress}
            />
          )}
        </View>
      </NavigationContent>
    </TabContext.Provider>
  );
}

const createCustomTabNavigator = createNavigatorFactory(TabNavigator);
const Tab = createCustomTabNavigator();

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator initialRouteName="HomeTab">
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="TasksTab" component={TasksStack} />
      <Tab.Screen name="ExpensesTab" component={ExpensesStack} />
      <Tab.Screen name="GoalsTab" component={GoalsStack} />
      <Tab.Screen name="NotesTab" component={NotesStack} />
      <Tab.Screen name="CalendarTab" component={CalendarStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
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
