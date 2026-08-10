import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../theme';

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

// Inline SVG-style person icon drawn with Views for Profile tab
const PersonIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
    {/* Head */}
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginBottom: 2,
      }}
    />
    {/* Body */}
    <View
      style={{
        width: 16,
        height: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        backgroundColor: color,
      }}
    />
  </View>
);

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        const iconColor = isActive ? colors.primary : colors.textSecondary;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            {/* Active indicator pill */}
            {isActive ? <View style={styles.activePill} /> : null}

            {/* Icon */}
            {tab.key === 'Profile' ? (
              <PersonIcon color={iconColor} />
            ) : (
              <Text style={[styles.icon, { color: iconColor }]}>{tab.icon}</Text>
            )}

            {/* Label */}
            <Text
              style={[
                styles.label,
                isActive && styles.activeLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(252,248,251,0.95)',
    borderTopWidth: 0,
    paddingTop: 8,
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    shadowColor: 'rgba(108,76,232,0.08)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    paddingVertical: 4,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
    lineHeight: 26,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.1,
    lineHeight: 13,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
});
