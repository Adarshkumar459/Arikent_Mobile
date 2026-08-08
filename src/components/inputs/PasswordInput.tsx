import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from './TextInput';
import { colors, typography } from '../../theme';

export type PasswordInputProps = Omit<TextInputProps, 'secureTextEntry'>;

export const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInput
      secureTextEntry={!showPassword}
      rightIcon={
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      }
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  toggleText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
});
