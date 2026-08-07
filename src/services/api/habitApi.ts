import { apiClient } from './client';

export type HabitFrequency = 'daily' | 'weekly';
export type HabitStatus = 'active' | 'archived';

export interface HabitReminder {
  enabled: boolean;
  time?: string;
  timezone?: string;
}

export interface HabitItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  frequency: HabitFrequency;
  reminder?: HabitReminder;
  targetPerPeriod?: number;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  lastCheckInAt?: string | null;
  status: HabitStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCheckInItem {
  id: string;
  habitId: string;
  userId: string;
  checkInDate: string;
  completedAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitStatsData {
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  completionRate: number;
  lastCheckInAt?: string | null;
}

export interface HabitListParams {
  page?: number;
  limit?: number;
  status?: HabitStatus;
  category?: string;
  frequency?: HabitFrequency;
}

export interface HabitPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HabitListResponseData {
  items: HabitItem[];
  pagination: HabitPagination;
}

export interface CreateHabitData {
  title: string;
  description?: string;
  category?: string;
  frequency: HabitFrequency;
  reminder?: HabitReminder;
  targetPerPeriod?: number;
}

export interface UpdateHabitData {
  title?: string;
  description?: string;
  category?: string;
  frequency?: HabitFrequency;
  reminder?: HabitReminder;
  targetPerPeriod?: number;
  status?: HabitStatus;
}

export interface CheckInHabitData {
  checkInDate?: string;
  note?: string;
}

export const habitApi = {
  getHabits: (params?: HabitListParams) =>
    apiClient.get<{ success: boolean; message: string; data: HabitListResponseData }>('/habits', { params }),

  getHabitById: (id: string) =>
    apiClient.get<{ success: boolean; message: string; data: { habit: HabitItem } }>(`/habits/${id}`),

  createHabit: (data: CreateHabitData) =>
    apiClient.post<{ success: boolean; message: string; data: { habit: HabitItem } }>('/habits', data),

  updateHabit: (id: string, data: UpdateHabitData) =>
    apiClient.patch<{ success: boolean; message: string; data: { habit: HabitItem } }>(`/habits/${id}`, data),

  deleteHabit: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/habits/${id}`),

  checkInHabit: (id: string, data?: CheckInHabitData) =>
    apiClient.post<{ success: boolean; message: string; data: { habit: HabitItem; checkIn: HabitCheckInItem } }>(`/habits/${id}/check-in`, data),

  getHabitHistory: (id: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<{ success: boolean; message: string; data: { items: HabitCheckInItem[]; pagination: HabitPagination } }>(`/habits/${id}/history`, { params }),

  getHabitStats: (id: string) =>
    apiClient.get<{ success: boolean; message: string; data: { stats: HabitStatsData } }>(`/habits/${id}/stats`),
};
