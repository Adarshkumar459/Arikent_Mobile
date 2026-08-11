import { colors } from './colors';
import { typography, fontFamily, fontSize, fontWeight, lineHeight } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { elevation } from './elevation';
import { getButtonStyle, ButtonVariant, ButtonState } from './buttons';

export const theme = {
  colors,
  typography,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
  radius,
  elevation,
  getButtonStyle,
} as const;

export type Theme = typeof theme;
export type { ButtonVariant, ButtonState };
export {
  colors,
  typography,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
  radius,
  elevation,
  getButtonStyle,
};
