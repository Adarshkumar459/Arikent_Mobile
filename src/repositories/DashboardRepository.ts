import {
  dashboardApi,
  DashboardData,
  DashboardParams,
} from '../services/api/dashboardApi';

export class DashboardRepository {
  public static async getDashboard(params?: DashboardParams): Promise<DashboardData> {
    const res = await dashboardApi.getDashboard(params);
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to fetch dashboard data');
  }

  public static async getDashboardForMonth(month: string): Promise<DashboardData> {
    return this.getDashboard({ month });
  }
}
