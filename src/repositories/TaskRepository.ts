import {
  taskApi,
  TaskItem,
  TaskListParams,
  TaskListResponseData,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  TaskRecurrence,
} from '../services/api/taskApi';

export class TaskRepository {
  public static async getTasks(params?: TaskListParams): Promise<TaskListResponseData> {
    const res = await taskApi.getTasks(params);
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to fetch tasks');
  }

  public static async getTaskById(id: string): Promise<TaskItem> {
    const res = await taskApi.getTaskById(id);
    if (res.data && res.data.success) {
      return res.data.data.task;
    }
    throw new Error(res.data?.message || 'Task not found');
  }

  public static async createTask(data: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: TaskPriority;
    dueDate?: string | null;
    recurrence?: TaskRecurrence | null;
  }): Promise<TaskItem> {
    const res = await taskApi.createTask(data);
    if (res.data && res.data.success) {
      return res.data.data.task;
    }
    throw new Error(res.data?.message || 'Failed to create task');
  }

  public static async updateTask(
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
  ): Promise<TaskItem> {
    const res = await taskApi.updateTask(id, data);
    if (res.data && res.data.success) {
      return res.data.data.task;
    }
    throw new Error(res.data?.message || 'Failed to update task');
  }

  public static async deleteTask(id: string): Promise<void> {
    const res = await taskApi.deleteTask(id);
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Failed to delete task');
    }
  }

  public static async completeTask(id: string): Promise<TaskItem> {
    const res = await taskApi.completeTask(id);
    if (res.data && res.data.success) {
      return res.data.data.task;
    }
    throw new Error(res.data?.message || 'Failed to complete task');
  }
}
