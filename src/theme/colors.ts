export const colors = {
  primary: '#5B4BFF',
  primaryDark: '#4338CA',
  primaryLight: '#EEF0FF',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  background: '#F8F9FC',
  surface: '#FFFFFF',
  textPrimary: '#171827',
  textSecondary: '#6B7280',
  textDisabled: '#A1A1AA',
  border: '#E5E7EB',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
