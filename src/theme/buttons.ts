import { ViewStyle, TextStyle } from 'react-native';
import { colors } from './colors';
import { radius } from './radius';
import { spacing } from './spacing';
import { typography } from './typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonState = 'default' | 'pressed' | 'disabled';

export interface ButtonStyleConfig {
  container: ViewStyle;
  text: TextStyle;
}

export const getButtonStyle = (
  variant: ButtonVariant = 'primary',
  state: ButtonState = 'default'
): ButtonStyleConfig => {
  const baseContainer: ViewStyle = {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  };

  const baseText: TextStyle = {
    ...typography.button,
  };

  if (state === 'disabled') {
    return {
      container: {
        ...baseContainer,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
      },
      text: {
        ...baseText,
        color: colors.textDisabled,
      },
    };
  }

  switch (variant) {
    case 'primary':
      return {
        container: {
          ...baseContainer,
          backgroundColor: state === 'pressed' ? colors.primaryDark : colors.primary,
        },
        text: {
          ...baseText,
          color: colors.surface,
        },
      };

    case 'secondary':
      return {
        container: {
          ...baseContainer,
          backgroundColor: colors.primaryLight,
        },
        text: {
          ...baseText,
          color: state === 'pressed' ? colors.primaryDark : colors.primary,
        },
      };

    case 'outline':
      return {
        container: {
          ...baseContainer,
          backgroundColor: state === 'pressed' ? colors.primaryLight : colors.transparent,
          borderWidth: 1.5,
          borderColor: state === 'pressed' ? colors.primaryDark : colors.primary,
        },
        text: {
          ...baseText,
          color: state === 'pressed' ? colors.primaryDark : colors.primary,
        },
      };

    case 'ghost':
      return {
        container: {
          ...baseContainer,
          backgroundColor: state === 'pressed' ? colors.primaryLight : colors.transparent,
        },
        text: {
          ...baseText,
          color: state === 'pressed' ? colors.primaryDark : colors.primary,
        },
      };

    case 'danger':
      return {
        container: {
          ...baseContainer,
          backgroundColor: state === 'pressed' ? '#DC2626' : colors.error,
        },
        text: {
          ...baseText,
          color: colors.surface,
        },
      };

    default:
      return {
        container: {
          ...baseContainer,
          backgroundColor: colors.primary,
        },
        text: {
          ...baseText,
          color: colors.surface,
        },
      };
  }
};
