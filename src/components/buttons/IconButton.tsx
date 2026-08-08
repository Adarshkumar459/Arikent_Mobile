import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onPress, disabled = false, style, size = 'md' }) => {
  const sizeStyle = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md;
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.base, sizeStyle, disabled && styles.disabled, style]}
      accessibilityRole="button"
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sm: { width: 36, height: 36, padding: spacing.xs },
  md: { width: 44, height: 44, padding: spacing.sm },
  lg: { width: 52, height: 52, padding: spacing.md },
  disabled: { opacity: 0.5 },
});
