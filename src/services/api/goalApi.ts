import { apiClient } from './client';

export type GoalCategory = 'learning' | 'money' | 'health' | 'career' | 'personal' | 'other';
export type GoalStatus = 'active' | 'completed' | 'archived';

export interface GoalMilestone {
  id: string;
  title: string;
  targetValue: number;
  completed: boolean;
  completedAt?: string | null;
  order: number;
}

export interface GoalHistory {
  id: string;
  value: number;
  progress: number;
  note?: string;
  recordedAt: string;
}

export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string | null;
  status: GoalStatus;
  milestones: GoalMilestone[];
  history: GoalHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalListParams {
  page?: number;
  limit?: number;
  status?: GoalStatus;
  category?: GoalCategory;
}

export interface GoalPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GoalListResponseData {
  items: GoalItem[];
  pagination: GoalPagination;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  category: GoalCategory;
  targetValue: number;
  currentValue?: number;
  unit: string;
  deadline?: string | null;
  milestones?: { title: string; targetValue: number; completed?: boolean; order?: number }[];
}

export interface UpdateGoalData {
  title?: string;
  description?: string;
  category?: GoalCategory;
  targetValue?: number;
  unit?: string;
  deadline?: string | null;
  status?: GoalStatus;
  milestones?: { title: string; targetValue: number; completed?: boolean; order?: number }[];
}

export interface UpdateProgressData {
  currentValue: number;
  note?: string;
}

export const goalApi = {
  getGoals: (params?: GoalListParams) =>
    apiClient.get<{ success: boolean; message: string; data: GoalListResponseData }>('/goals', { params }),

  getGoalById: (id: string) =>
    apiClient.get<{ success: boolean; message: string; data: { goal: GoalItem } }>(`/goals/${id}`),

  createGoal: (data: CreateGoalData) =>
    apiClient.post<{ success: boolean; message: string; data: { goal: GoalItem } }>('/goals', data),

  updateGoal: (id: string, data: UpdateGoalData) =>
    apiClient.patch<{ success: boolean; message: string; data: { goal: GoalItem } }>(`/goals/${id}`, data),

  updateGoalProgress: (id: string, data: UpdateProgressData) =>
    apiClient.patch<{ success: boolean; message: string; data: { goal: GoalItem } }>(`/goals/${id}/progress`, data),

  toggleMilestone: (id: string, milestoneId: string, completed?: boolean) =>
    apiClient.patch<{ success: boolean; message: string; data: { goal: GoalItem } }>(`/goals/${id}/milestones/${milestoneId}`, { completed }),

  deleteGoal: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/goals/${id}`),
};
