import { apiClient } from './client';

export type ReminderType = 'task' | 'goal' | 'bill' | 'calendar' | 'general';
export type ReminderStatus = 'scheduled' | 'completed' | 'cancelled';

export interface ReminderItem {
  id: string;
  userId: string;
  title: string;
  type: ReminderType;
  referenceId?: string;
  scheduledAt: string;
  status: ReminderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderListParams {
  page?: number;
  limit?: number;
  status?: ReminderStatus;
  type?: ReminderType;
}

export interface ReminderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateReminderData {
  title: string;
  type: ReminderType;
  referenceId?: string;
  scheduledAt: string;
  status?: ReminderStatus;
}

export interface UpdateReminderData {
  title?: string;
  type?: ReminderType;
  referenceId?: string;
  scheduledAt?: string;
  status?: ReminderStatus;
}

export const reminderApi = {
  getReminders: (params?: ReminderListParams) =>
    apiClient.get<{ success: boolean; message: string; data: { items: ReminderItem[]; pagination: ReminderPagination } }>('/reminders', { params }),

  getReminderById: (id: string) =>
    apiClient.get<{ success: boolean; message: string; data: { reminder: ReminderItem } }>(`/reminders/${id}`),

  createReminder: (data: CreateReminderData) =>
    apiClient.post<{ success: boolean; message: string; data: { reminder: ReminderItem } }>('/reminders', data),

  updateReminder: (id: string, data: UpdateReminderData) =>
    apiClient.patch<{ success: boolean; message: string; data: { reminder: ReminderItem } }>(`/reminders/${id}`, data),

  deleteReminder: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/reminders/${id}`),
};
