import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../theme';

export interface TabItem {
  key: string;
  label: string;
  icon: string;
}

export interface BottomNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.activeIcon]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...elevation.medium,
  },
  tab: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xs, flex: 1 },
  icon: { fontSize: 20, color: colors.textSecondary },
  activeIcon: { color: colors.primary },
  label: { ...typography.caption, fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  activeLabel: { color: colors.primary, fontWeight: '700' },
});
