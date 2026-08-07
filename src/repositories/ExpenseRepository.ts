import {
  expenseApi,
  ExpenseItem,
  MonthlyExpenseSummaryData,
  ExpenseAnalyticsData,
  ExpenseListParams,
  ExpensePagination,
  CreateExpenseData,
  UpdateExpenseData,
} from '../services/api/expenseApi';

export class ExpenseRepository {
  public static async getExpenses(params?: ExpenseListParams): Promise<{ items: ExpenseItem[]; pagination: ExpensePagination }> {
    const res = await expenseApi.getExpenses(params);
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to fetch expenses');
  }

  public static async getExpenseById(id: string): Promise<ExpenseItem> {
    const res = await expenseApi.getExpenseById(id);
    if (res.data && res.data.success) {
      return res.data.data.expense;
    }
    throw new Error(res.data?.message || 'Expense not found');
  }

  public static async getMonthlySummary(month?: string): Promise<MonthlyExpenseSummaryData> {
    const res = await expenseApi.getMonthlySummary({ month });
    if (res.data && res.data.success) {
      return res.data.data.summary;
    }
    throw new Error(res.data?.message || 'Failed to fetch monthly expense summary');
  }

  public static async getAnalytics(month?: string): Promise<ExpenseAnalyticsData> {
    const res = await expenseApi.getAnalytics({ month });
    if (res.data && res.data.success) {
      return res.data.data.analytics;
    }
    throw new Error(res.data?.message || 'Failed to fetch expense analytics');
  }

  public static async createExpense(data: CreateExpenseData): Promise<ExpenseItem> {
    const res = await expenseApi.createExpense(data);
    if (res.data && res.data.success) {
      return res.data.data.expense;
    }
    throw new Error(res.data?.message || 'Failed to create expense');
  }

  public static async updateExpense(id: string, data: UpdateExpenseData): Promise<ExpenseItem> {
    const res = await expenseApi.updateExpense(id, data);
    if (res.data && res.data.success) {
      return res.data.data.expense;
    }
    throw new Error(res.data?.message || 'Failed to update expense');
  }

  public static async deleteExpense(id: string): Promise<void> {
    const res = await expenseApi.deleteExpense(id);
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Failed to delete expense');
    }
  }
}
