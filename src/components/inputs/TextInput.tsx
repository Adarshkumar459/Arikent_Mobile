import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, TextInputProps as RNTextInputProps, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  onClear?: () => void;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  required,
  style,
  onFocus,
  onBlur,
  disabled,
  editable = true,
  onClear,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const isEditable = editable && !disabled;

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={styles.label}>
          {label} {required ? <Text style={styles.required}>*</Text> : null}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedWrapper,
          !!error && styles.errorWrapper,
          !isEditable && styles.disabledWrapper,
        ]}
      >
        {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}
        <RNTextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textSecondary}
          editable={isEditable}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {onClear && value ? (
          <TouchableOpacity onPress={onClear} style={styles.iconContainer}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconContainer}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.xs, width: '100%' },
  label: { ...typography.caption, color: colors.textPrimary, fontWeight: '700' },
  required: { color: colors.error },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  focusedWrapper: { borderColor: colors.primary, borderWidth: 1.5 },
  errorWrapper: { borderColor: colors.error },
  disabledWrapper: { backgroundColor: colors.background, opacity: 0.7 },
  input: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: spacing.sm },
  iconContainer: { marginHorizontal: spacing.xs, justifyContent: 'center', alignItems: 'center' },
  clearIcon: { fontSize: 16, color: colors.textSecondary },
  errorText: { ...typography.caption, color: colors.error },
  helperText: { ...typography.caption, color: colors.textSecondary },
});
