import { apiClient } from './client';

export type ExpenseType = 'income' | 'expense';
export type ExpenseCategory = 'food' | 'travel' | 'bills' | 'shopping' | 'health' | 'education' | 'other';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';

export interface ExpenseItem {
  id: string;
  userId: string;
  type: ExpenseType;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  date: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyExpenseSummaryData {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface CategoryAnalyticsItemData {
  category: ExpenseCategory;
  total: number;
  percentage: number;
}

export interface ExpenseAnalyticsData {
  month: string;
  totalExpense: number;
  breakdown: CategoryAnalyticsItemData[];
}

export interface ExpenseListParams {
  page?: number;
  limit?: number;
  month?: string;
  year?: string;
  type?: ExpenseType;
  category?: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

export interface ExpensePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateExpenseData {
  type: ExpenseType;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  date?: string;
  paymentMethod?: PaymentMethod;
}

export interface UpdateExpenseData {
  type?: ExpenseType;
  amount?: number;
  category?: ExpenseCategory;
  note?: string;
  date?: string;
  paymentMethod?: PaymentMethod;
}

export const expenseApi = {
  getExpenses: (params?: ExpenseListParams) =>
    apiClient.get<{ success: boolean; message: string; data: { items: ExpenseItem[]; pagination: ExpensePagination } }>('/expenses', { params }),

  getExpenseById: (id: string) =>
    apiClient.get<{ success: boolean; message: string; data: { expense: ExpenseItem } }>(`/expenses/${id}`),

  getMonthlySummary: (params?: { month?: string }) =>
    apiClient.get<{ success: boolean; message: string; data: { summary: MonthlyExpenseSummaryData } }>('/expenses/summary', { params }),

  getAnalytics: (params?: { month?: string }) =>
    apiClient.get<{ success: boolean; message: string; data: { analytics: ExpenseAnalyticsData } }>('/expenses/analytics', { params }),

  createExpense: (data: CreateExpenseData) =>
    apiClient.post<{ success: boolean; message: string; data: { expense: ExpenseItem } }>('/expenses', data),

  updateExpense: (id: string, data: UpdateExpenseData) =>
    apiClient.patch<{ success: boolean; message: string; data: { expense: ExpenseItem } }>(`/expenses/${id}`, data),

  deleteExpense: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/expenses/${id}`),
};
