import {
  noteApi,
  NoteItem,
  NoteListParams,
  NotePagination,
  CreateNoteData,
  UpdateNoteData,
} from '../services/api/noteApi';

export class NoteRepository {
  public static async getNotes(params?: NoteListParams): Promise<{ items: NoteItem[]; pagination: NotePagination }> {
    const res = await noteApi.getNotes(params);
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to fetch notes');
  }

  public static async getNoteById(id: string): Promise<NoteItem> {
    const res = await noteApi.getNoteById(id);
    if (res.data && res.data.success) {
      return res.data.data.note;
    }
    throw new Error(res.data?.message || 'Note not found');
  }

  public static async createNote(data: CreateNoteData): Promise<NoteItem> {
    const res = await noteApi.createNote(data);
    if (res.data && res.data.success) {
      return res.data.data.note;
    }
    throw new Error(res.data?.message || 'Failed to create note');
  }

  public static async updateNote(id: string, data: UpdateNoteData): Promise<NoteItem> {
    const res = await noteApi.updateNote(id, data);
    if (res.data && res.data.success) {
      return res.data.data.note;
    }
    throw new Error(res.data?.message || 'Failed to update note');
  }

  public static async deleteNote(id: string): Promise<void> {
    const res = await noteApi.deleteNote(id);
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Failed to delete note');
    }
  }

  public static async togglePin(id: string, isPinned?: boolean): Promise<NoteItem> {
    const res = await noteApi.togglePin(id, isPinned);
    if (res.data && res.data.success) {
      return res.data.data.note;
    }
    throw new Error(res.data?.message || 'Failed to toggle pin');
  }

  public static async toggleArchive(id: string, isArchived?: boolean): Promise<NoteItem> {
    const res = await noteApi.toggleArchive(id, isArchived);
    if (res.data && res.data.success) {
      return res.data.data.note;
    }
    throw new Error(res.data?.message || 'Failed to toggle archive');
  }
}
