import { apiClient } from './client';

export interface DashboardParams {
  month?: string;
}

export interface CalendarDayData {
  date: string;
  tasksCount?: number;
  hasHighPriority?: boolean;
  hasTasks?: boolean;
}

export interface DashboardData {
  date: string;
  user: {
    name: string;
    email: string;
    avatar: string | null;
    timezone: string;
  };
  summary: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    completionRate: number;
  };
  today: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  };
  todayTasks: Array<{
    _id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    category?: string;
    dueDate?: string;
  }>;
  upcomingTasks?: Array<{
    _id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    category?: string;
    dueDate?: string;
  }>;
  calendar?: CalendarDayData[];
  goals: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
  expenses: {
    month: string;
    currency: string;
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
  };
  upcomingReminders: Array<{
    _id: string;
    title: string;
    scheduledAt: string;
    category?: string;
  }>;
}

export const dashboardApi = {
  getDashboard: (params?: DashboardParams) =>
    apiClient.get<{ success: boolean; message: string; data: DashboardData }>('/dashboard', { params }),
};
