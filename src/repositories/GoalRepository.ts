import {
  goalApi,
  GoalItem,
  GoalListParams,
  GoalListResponseData,
  CreateGoalData,
  UpdateGoalData,
  UpdateProgressData,
} from '../services/api/goalApi';

export class GoalRepository {
  public static async getGoals(params?: GoalListParams): Promise<GoalListResponseData> {
    const res = await goalApi.getGoals(params);
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to fetch goals');
  }

  public static async getGoalById(id: string): Promise<GoalItem> {
    const res = await goalApi.getGoalById(id);
    if (res.data && res.data.success) {
      return res.data.data.goal;
    }
    throw new Error(res.data?.message || 'Goal not found');
  }

  public static async createGoal(data: CreateGoalData): Promise<GoalItem> {
    const res = await goalApi.createGoal(data);
    if (res.data && res.data.success) {
      return res.data.data.goal;
    }
    throw new Error(res.data?.message || 'Failed to create goal');
  }

  public static async updateGoal(id: string, data: UpdateGoalData): Promise<GoalItem> {
    const res = await goalApi.updateGoal(id, data);
    if (res.data && res.data.success) {
      return res.data.data.goal;
    }
    throw new Error(res.data?.message || 'Failed to update goal');
  }

  public static async updateGoalProgress(id: string, data: UpdateProgressData): Promise<GoalItem> {
    const res = await goalApi.updateGoalProgress(id, data);
    if (res.data && res.data.success) {
      return res.data.data.goal;
    }
    throw new Error(res.data?.message || 'Failed to update goal progress');
  }

  public static async toggleMilestone(id: string, milestoneId: string, completed?: boolean): Promise<GoalItem> {
    const res = await goalApi.toggleMilestone(id, milestoneId, completed);
    if (res.data && res.data.success) {
      return res.data.data.goal;
    }
    throw new Error(res.data?.message || 'Failed to update milestone status');
  }

  public static async deleteGoal(id: string): Promise<void> {
    const res = await goalApi.deleteGoal(id);
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Failed to delete goal');
    }
  }
}
