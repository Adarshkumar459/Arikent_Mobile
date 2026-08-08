import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from './TextInput';
import { colors, typography } from '../../theme';

export interface DateInputProps extends Omit<TextInputProps, 'onPress'> {
  onPressDate?: () => void;
  onChangeDate?: (date: string) => void;
}

export const DateInput: React.FC<DateInputProps> = ({ onPressDate, onChangeDate, onChangeText, ...props }) => {
  const handleChangeText = (text: string) => {
    onChangeText?.(text);
    onChangeDate?.(text);
  };

  return (
    <TouchableOpacity onPress={onPressDate} activeOpacity={0.8}>
      <TextInput
        rightIcon={<Text style={styles.icon}>📅</Text>}
        onChangeText={handleChangeText}
        {...props}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: { ...typography.body, color: colors.textSecondary },
});
