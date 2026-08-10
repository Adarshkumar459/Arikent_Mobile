export const colors = {
  // Brand colors (Stitch Arkient System)
  primary: '#532DCF',
  primaryContainer: '#6C4CE8',
  onPrimaryContainer: '#EEE7FF',
  primaryAccent: '#6C4CE8',
  primaryDark: '#1C0062',
  primaryLight: '#E6DEFF',
  secondary: '#603ED4',
  secondaryContainer: '#795AEE',
  softPurple: '#F4F1FF',

  // Semantic & Tertiary
  tertiary: '#005D42',
  tertiaryContainer: '#007856',
  onTertiaryContainer: '#8FFFCF',

  // Status colors & backgrounds
  success: '#007856',
  successBackground: '#E8F8EE',
  warning: '#F59E0B',
  warningBackground: '#FEF3C7',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  errorBackground: '#FFDAD6',
  info: '#3B82F6',
  infoBackground: '#EFF6FF',

  // Surfaces & Backgrounds
  background: '#FCF8FB',
  surface: '#FCF8FB',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F6F3F5',
  surfaceContainer: '#F0EDEF',
  surfaceContainerHigh: '#EAE7EA',
  surfaceContainerHighest: '#E4E2E4',
  surfaceVariant: '#E4E2E4',
  surfaceDim: '#DCD9DC',
  card: '#FFFFFF',

  // Text
  textPrimary: '#1B1B1D',
  textSecondary: '#484555',
  onSurface: '#1B1B1D',
  onSurfaceVariant: '#484555',
  outline: '#797586',
  outlineVariant: '#C9C4D7',
  textDisabled: '#A1A1AA',
  textMuted: '#797586',
  textLight: '#FFFFFF',

  // Nested semantic text token accessor
  text: {
    primary: '#1B1B1D',
    secondary: '#484555',
    disabled: '#A1A1AA',
    muted: '#797586',
    light: '#FFFFFF',
  },

  // Borders & Dividers
  border: '#E4E2E4',
  divider: '#F0EDEF',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
