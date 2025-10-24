// src/stores/useNotesStore.ts
import create from 'zustand';
import { Note, NoteAttachment } from '../types/note';
import { loadNotes, saveNotes } from '../services/notesStorage';
import { nanoid } from 'nanoid/non-secure';
import { cleanupOrphanedFiles } from '../services/notesCleanup';

type NotesState = {
  getById: (id: string) => Note | undefined;
  notes: Note[];
  initialized: boolean;
  load: () => Promise<void>;
  addNote: (partial: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, patch: Partial<Note>) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<void>;
  addAttachment: (noteId: string, attachment: Omit<NoteAttachment, 'id'> & { uri: string }) => Promise<void>;
  removeAttachment: (noteId: string, attachmentId: string) => Promise<void>;
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  initialized: false,

  load: async () => {
    const fromStorage = await loadNotes();
    set({ notes: fromStorage, initialized: true });
    // Run cleanup in background; don't block UI/startup
    cleanupOrphanedFiles().catch(() => {});
  },

  addNote: async (partial: Partial<Note>) => {
    const now = new Date().toISOString();
    const note: Note = {
      id: nanoid(),
      title: partial.title ?? '',
      body: partial.body ?? '',
      tags: partial.tags ?? [],
      pinned: !!partial.pinned,
      attachments: partial.attachments ?? [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newNotes = [note, ...state.notes];
      saveNotes(newNotes);
      return { notes: newNotes };
    });
    return note;
  },

  updateNote: async (id: string, patch: Partial<Note>) => {
    let updated: Note | null = null;
    set((state) => {
      const newNotes = state.notes.map((n) => {
        if (n.id !== id) return n;
        const merged = { ...n, ...patch, updatedAt: new Date().toISOString() };
        updated = merged;
        return merged;
      });
      saveNotes(newNotes);
      return { notes: newNotes };
    });
    return updated;
  },

  deleteNote: async (id: string) => {
    set((state) => {
      const newNotes = state.notes.filter((n) => n.id !== id);
      saveNotes(newNotes);
      return { notes: newNotes };
    });
  },

  getById: (id: string) => {
    return get().notes.find((n) => n.id === id);
  },

  addAttachment: async (noteId: string, attachment: Omit<NoteAttachment, 'id'> & { uri: string }) => {
    set((state) => {
      const newNotes = state.notes.map((n) => {
        if (n.id !== noteId) return n;
        const att = {
          id: nanoid(),
          uri: attachment.uri,
          mimeType: attachment.mimeType,
          createdAt: new Date().toISOString(),
        };
        const updatedNote = {
          ...n,
          attachments: [...(n.attachments ?? []), att],
          updatedAt: new Date().toISOString(),
        };
        return updatedNote;
      });
      saveNotes(newNotes);
      return { notes: newNotes };
    });
  },

  removeAttachment: async (noteId: string, attachmentId: string) => {
    set((state) => {
      const newNotes = state.notes.map((n) => {
        if (n.id !== noteId) return n;
        const attachments = (n.attachments ?? []).filter((a) => a.id !== attachmentId);
        return { ...n, attachments, updatedAt: new Date().toISOString() };
      });
      saveNotes(newNotes);
      return { notes: newNotes };
    });
  },
}));

export default useNotesStore;
