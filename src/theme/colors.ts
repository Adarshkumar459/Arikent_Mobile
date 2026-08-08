export const colors = {
  // Brand colors
  primary: '#5B51D8',
  primaryAccent: '#5844FF',
  primaryDark: '#4338CA',
  primaryLight: '#F0EFFF',
  secondary: '#7000FF',
  softPurple: '#F0EFFF',

  // Status colors & backgrounds
  success: '#22C55E',
  successBackground: '#E8F8EE',
  warning: '#F59E0B',
  warningBackground: '#FEF3C7',
  error: '#EF4444',
  errorBackground: '#FEE2E2',
  info: '#3B82F6',
  infoBackground: '#EFF6FF',

  // Surfaces & Backgrounds
  background: '#F8F9FE',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text
  textPrimary: '#171827',
  textSecondary: '#6B7280',
  textDisabled: '#A1A1AA',
  textMuted: '#9CA3AF',
  textLight: '#FFFFFF',

  // Nested semantic text token accessor
  text: {
    primary: '#171827',
    secondary: '#6B7280',
    disabled: '#A1A1AA',
    muted: '#9CA3AF',
    light: '#FFFFFF',
  },

  // Borders & Dividers
  border: '#E5E7EB',
  divider: '#F3F4F6',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
