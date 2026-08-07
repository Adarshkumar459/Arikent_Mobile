import {
  calendarApi,
  CalendarEventItem,
  CalendarEventListParams,
  CalendarPagination,
  CreateCalendarEventData,
  UpdateCalendarEventData,
} from '../services/api/calendarApi';

export class CalendarRepository {
  public static async getEvents(params?: CalendarEventListParams): Promise<{ items: CalendarEventItem[]; pagination: CalendarPagination }> {
    const res = await calendarApi.getEvents(params);
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to fetch calendar events');
  }

  public static async getEventById(id: string): Promise<CalendarEventItem> {
    const res = await calendarApi.getEventById(id);
    if (res.data && res.data.success) {
      return res.data.data.event;
    }
    throw new Error(res.data?.message || 'Event not found');
  }

  public static async createEvent(data: CreateCalendarEventData): Promise<CalendarEventItem> {
    const res = await calendarApi.createEvent(data);
    if (res.data && res.data.success) {
      return res.data.data.event;
    }
    throw new Error(res.data?.message || 'Failed to create event');
  }

  public static async updateEvent(id: string, data: UpdateCalendarEventData): Promise<CalendarEventItem> {
    const res = await calendarApi.updateEvent(id, data);
    if (res.data && res.data.success) {
      return res.data.data.event;
    }
    throw new Error(res.data?.message || 'Failed to update event');
  }

  public static async deleteEvent(id: string): Promise<void> {
    const res = await calendarApi.deleteEvent(id);
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Failed to delete event');
    }
  }
}
