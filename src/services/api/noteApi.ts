import { apiClient } from './client';

export interface NoteAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  attachments?: NoteAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteListParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  q?: string;
}

export interface NotePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateNoteData {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  attachments?: NoteAttachment[];
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  attachments?: NoteAttachment[];
}

export const noteApi = {
  getNotes: (params?: NoteListParams) =>
    apiClient.get<{ success: boolean; message: string; data: { items: NoteItem[]; pagination: NotePagination } }>('/notes', { params }),

  getNoteById: (id: string) =>
    apiClient.get<{ success: boolean; message: string; data: { note: NoteItem } }>(`/notes/${id}`),

  createNote: (data: CreateNoteData) =>
    apiClient.post<{ success: boolean; message: string; data: { note: NoteItem } }>('/notes', data),

  updateNote: (id: string, data: UpdateNoteData) =>
    apiClient.patch<{ success: boolean; message: string; data: { note: NoteItem } }>(`/notes/${id}`, data),

  deleteNote: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/notes/${id}`),

  togglePin: (id: string, isPinned?: boolean) =>
    apiClient.patch<{ success: boolean; message: string; data: { note: NoteItem } }>(`/notes/${id}/pin`, { isPinned }),

  toggleArchive: (id: string, isArchived?: boolean) =>
    apiClient.patch<{ success: boolean; message: string; data: { note: NoteItem } }>(`/notes/${id}/archive`, { isArchived }),
};
