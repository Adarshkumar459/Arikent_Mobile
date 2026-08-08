import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from './TextInput';
import { colors, typography } from '../../theme';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownInputProps extends TextInputProps {
  onPressSelect?: () => void;
  options?: DropdownOption[];
  items?: DropdownOption[];
  onSelect?: (value: any) => void;
}

export const DropdownInput: React.FC<DropdownInputProps> = ({
  onPressSelect,
  options,
  items,
  onSelect,
  value,
  ...props
}) => {
  const displayValue = value || '';

  return (
    <TouchableOpacity onPress={onPressSelect} activeOpacity={0.8}>
      <TextInput
        editable={false}
        pointerEvents="none"
        value={displayValue}
        rightIcon={<Text style={styles.icon}>▼</Text>}
        {...props}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
});
