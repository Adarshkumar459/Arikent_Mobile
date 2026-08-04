import React, { useState } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { getButtonStyle, ButtonVariant, ButtonState, colors } from '../../theme';

export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  state?: ButtonState;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  state: stateProp,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const currentState: ButtonState =
    disabled || isLoading
      ? 'disabled'
      : stateProp
      ? stateProp
      : isPressed
      ? 'pressed'
      : 'default';

  const styleConfig = getButtonStyle(variant, currentState);

  return (
    <Pressable
      onPress={disabled || isLoading ? undefined : onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styleConfig.container, style]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.surface : colors.primary}
        />
      ) : (
        <Text style={[styleConfig.text, textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
};
