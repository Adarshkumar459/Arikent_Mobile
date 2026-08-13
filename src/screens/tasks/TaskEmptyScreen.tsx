import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, radius, elevation } from '../../theme';

export const TaskEmptyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* Floating illustration container */}
      <View style={styles.illustrationBox}>
        <View style={styles.blurGlow} />
        <Text style={styles.illustrationEmoji}>📋✍️</Text>
      </View>

      <Text style={styles.title}>No tasks yet</Text>
      <Text style={styles.subtitle}>
        Create your first task and start organizing your day efficiently.
      </Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.85}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  illustrationBox: {
    width: 140,
    height: 140,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  blurGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight + '50',
  },
  illustrationEmoji: {
    fontSize: 54,
  },
  title: {
    ...typography.heading2,
    fontSize: 22,
    color: colors.onSurface,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  addButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.medium,
  },
  addButtonText: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.textLight,
  },
});
