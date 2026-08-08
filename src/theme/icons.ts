export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

export const iconNames = {
  home: 'home',
  tasks: 'clipboard-list',
  expenses: 'credit-card',
  goals: 'target',
  calendar: 'calendar',
  reminders: 'bell',
  notes: 'document-text',
  habits: 'zap',
  profile: 'user',
  settings: 'cog',
  add: 'plus',
  edit: 'pencil',
  delete: 'trash',
  search: 'search',
  filter: 'filter',
  chevronRight: 'chevron-right',
  chevronLeft: 'chevron-left',
  check: 'check',
  close: 'x',
} as const;

export type IconSize = typeof iconSizes;
