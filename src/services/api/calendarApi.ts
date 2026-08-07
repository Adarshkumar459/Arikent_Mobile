import { apiClient } from './client';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number;
  until?: string | null;
}

export interface CalendarEventItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  category?: string;
  recurrence?: RecurrenceRule;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventListParams {
  start?: string;
  end?: string;
  page?: number;
  limit?: number;
}

export interface CalendarPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateCalendarEventData {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  category?: string;
  recurrence?: RecurrenceRule;
}

export interface UpdateCalendarEventData {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  allDay?: boolean;
  category?: string;
  recurrence?: RecurrenceRule;
}

export const calendarApi = {
  getEvents: (params?: CalendarEventListParams) =>
    apiClient.get<{ success: boolean; message: string; data: { items: CalendarEventItem[]; pagination: CalendarPagination } }>('/calendar/events', { params }),

  getEventById: (id: string) =>
    apiClient.get<{ success: boolean; message: string; data: { event: CalendarEventItem } }>(`/calendar/events/${id}`),

  createEvent: (data: CreateCalendarEventData) =>
    apiClient.post<{ success: boolean; message: string; data: { event: CalendarEventItem } }>('/calendar/events', data),

  updateEvent: (id: string, data: UpdateCalendarEventData) =>
    apiClient.patch<{ success: boolean; message: string; data: { event: CalendarEventItem } }>(`/calendar/events/${id}`, data),

  deleteEvent: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/calendar/events/${id}`),
};
