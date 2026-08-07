import {
  habitApi,
  HabitItem,
  HabitCheckInItem,
  HabitStatsData,
  HabitListParams,
  HabitListResponseData,
  CreateHabitData,
  UpdateHabitData,
  CheckInHabitData,
  HabitPagination,
} from '../services/api/habitApi';

export class HabitRepository {
  public static async getHabits(params?: HabitListParams): Promise<HabitListResponseData> {
    const res = await habitApi.getHabits(params);
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to fetch habits');
  }

  public static async getHabitById(id: string): Promise<HabitItem> {
    const res = await habitApi.getHabitById(id);
    if (res.data && res.data.success) {
      return res.data.data.habit;
    }
    throw new Error(res.data?.message || 'Habit not found');
  }

  public static async createHabit(data: CreateHabitData): Promise<HabitItem> {
    const res = await habitApi.createHabit(data);
    if (res.data && res.data.success) {
      return res.data.data.habit;
    }
    throw new Error(res.data?.message || 'Failed to create habit');
  }

  public static async updateHabit(id: string, data: UpdateHabitData): Promise<HabitItem> {
    const res = await habitApi.updateHabit(id, data);
    if (res.data && res.data.success) {
      return res.data.data.habit;
    }
    throw new Error(res.data?.message || 'Failed to update habit');
  }

  public static async deleteHabit(id: string): Promise<void> {
    const res = await habitApi.deleteHabit(id);
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Failed to delete habit');
    }
  }

  public static async checkInHabit(id: string, data?: CheckInHabitData): Promise<{ habit: HabitItem; checkIn: HabitCheckInItem }> {
    const res = await habitApi.checkInHabit(id, data);
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to check in habit');
  }

  public static async getHabitHistory(id: string, params?: { page?: number; limit?: number }): Promise<{ items: HabitCheckInItem[]; pagination: HabitPagination }> {
    const res = await habitApi.getHabitHistory(id, params);
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to fetch habit history');
  }

  public static async getHabitStats(id: string): Promise<HabitStatsData> {
    const res = await habitApi.getHabitStats(id);
    if (res.data && res.data.success) {
      return res.data.data.stats;
    }
    throw new Error(res.data?.message || 'Failed to fetch habit stats');
  }
}
