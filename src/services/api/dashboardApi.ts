import { apiClient } from './client';
import { TaskItem } from './taskApi';

export interface DashboardSummaryData {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  completionRate: number;
}

export interface TodaySummaryData {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
}

export interface CalendarDayData {
  date: string; // YYYY-MM-DD
  taskCount: number;
  hasTasks: boolean;
}

export interface DashboardUserData {
  name: string;
  email: string;
  avatar: string | null;
  timezone: string;
}

export interface DashboardData {
  date: string;
  user: DashboardUserData;
  summary: DashboardSummaryData;
  today: TodaySummaryData;
  todayTasks: TaskItem[];
  upcomingTasks: TaskItem[];
  calendar: CalendarDayData[];
}

export interface DashboardParams {
  month?: string; // YYYY-MM
  date?: string; // YYYY-MM-DD
}

export const dashboardApi = {
  getDashboard: (params?: DashboardParams) =>
    apiClient.get<{ success: boolean; message: string; data: DashboardData }>('/dashboard', { params }),
};
