import {
  reminderApi,
  ReminderItem,
  ReminderListParams,
  ReminderPagination,
  CreateReminderData,
  UpdateReminderData,
} from '../services/api/reminderApi';

export class ReminderRepository {
  public static async getReminders(params?: ReminderListParams): Promise<{ items: ReminderItem[]; pagination: ReminderPagination }> {
    const res = await reminderApi.getReminders(params);
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to fetch reminders');
  }

  public static async getReminderById(id: string): Promise<ReminderItem> {
    const res = await reminderApi.getReminderById(id);
    if (res.data && res.data.success) {
      return res.data.data.reminder;
    }
    throw new Error(res.data?.message || 'Reminder not found');
  }

  public static async createReminder(data: CreateReminderData): Promise<ReminderItem> {
    const res = await reminderApi.createReminder(data);
    if (res.data && res.data.success) {
      return res.data.data.reminder;
    }
    throw new Error(res.data?.message || 'Failed to create reminder');
  }

  public static async updateReminder(id: string, data: UpdateReminderData): Promise<ReminderItem> {
    const res = await reminderApi.updateReminder(id, data);
    if (res.data && res.data.success) {
      return res.data.data.reminder;
    }
    throw new Error(res.data?.message || 'Failed to update reminder');
  }

  public static async deleteReminder(id: string): Promise<void> {
    const res = await reminderApi.deleteReminder(id);
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Failed to delete reminder');
    }
  }
}
