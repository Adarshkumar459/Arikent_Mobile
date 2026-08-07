import { apiClient } from './client';

export type TaskCategory = 'personal' | 'work' | 'home' | 'finance' | 'health' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface TaskRecurrence {
  frequency: RecurrenceFrequency;
  interval?: number;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  completedAt?: string | null;
  recurrence?: TaskRecurrence | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
}

export interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TaskListResponseData {
  items: TaskItem[];
  pagination: TaskPagination;
}

export const taskApi = {
  getTasks: (params?: TaskListParams) =>
    apiClient.get<{ success: boolean; message: string; data: TaskListResponseData }>('/tasks', { params }),

  createTask: (data: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: TaskPriority;
    dueDate?: string | null;
    recurrence?: TaskRecurrence | null;
  }) =>
    apiClient.post<{ success: boolean; message: string; data: { task: TaskItem } }>('/tasks', data),

  getTaskById: (id: string) =>
    apiClient.get<{ success: boolean; message: string; data: { task: TaskItem } }>(`/tasks/${id}`),

  updateTask: (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      category: TaskCategory;
      priority: TaskPriority;
      status: TaskStatus;
      dueDate: string | null;
      recurrence: TaskRecurrence | null;
    }>
  ) =>
    apiClient.patch<{ success: boolean; message: string; data: { task: TaskItem } }>(`/tasks/${id}`, data),

  deleteTask: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/tasks/${id}`),

  completeTask: (id: string) =>
    apiClient.post<{ success: boolean; message: string; data: { task: TaskItem } }>(`/tasks/${id}/complete`),
};
