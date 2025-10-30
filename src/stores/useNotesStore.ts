// src/stores/useNotesStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist } from 'zustand/middleware';
import { Note, NoteAttachment } from '../types/note';
import { nanoid } from 'nanoid/non-secure';

type NotesStore = {
  notes: Note[];
  load: () => Promise<void>;
  addNote: (data: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addAttachment: (id: string, att: NoteAttachment) => Promise<void>;
  removeAttachment: (id: string, attachmentId: string) => Promise<void>;
  clearAllNotes: () => Promise<void>;
};

function safeArray(value: unknown): Note[] {
  // value might be:
  // - an array of notes (good)
  // - an object that contains notes (old shape)
  // - anything else (fallback empty array)
  if (Array.isArray(value)) return value as Note[];
  if (value && typeof value === 'object') {
    const asObj = value as any;
    if (Array.isArray(asObj.notes)) return asObj.notes as Note[];
    // sometimes persist wrapped state inside { state: { notes: [...] } }
    if (asObj.state && Array.isArray(asObj.state.notes)) return asObj.state.notes as Note[];
  }
  return [];
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],

      load: async () => {
        try {
          const stored = await AsyncStorage.getItem('notes');
          if (!stored) return;
          const parsed = JSON.parse(stored);
          const arr = safeArray(parsed);
          set({ notes: arr });
        } catch (e) {
          console.error('load error', e);
        }
      },

      addNote: async (data) => {
        const newNote: Note = {
          id: data.id ?? nanoid(),
          title: data.title ?? 'Untitled',
          body: data.body ?? '',
          attachments: Array.isArray(data.attachments) ? (data.attachments as NoteAttachment[]) : [],
          createdAt: data.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: data.tags ?? [],
          pinned: !!data.pinned,
        };

        // be defensive: ensure existingNotes is an array
        const existing = safeArray(get().notes);
        const updated = [newNote, ...existing];
        set({ notes: updated });

        try {
          await AsyncStorage.setItem('notes', JSON.stringify(updated));
        } catch (e) {
          console.error('persist addNote error', e);
        }

        return newNote;
      },

      updateNote: async (id, data) => {
        const existing = safeArray(get().notes);
        const updated = existing.map((n) =>
          n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n
        );
        set({ notes: updated });

        try {
          await AsyncStorage.setItem('notes', JSON.stringify(updated));
        } catch (e) {
          console.error('persist updateNote error', e);
        }
      },

      deleteNote: async (id) => {
        const existing = safeArray(get().notes);
        const updated = existing.filter((n) => n.id !== id);
        set({ notes: updated });

        try {
          await AsyncStorage.setItem('notes', JSON.stringify(updated));
        } catch (e) {
          console.error('persist deleteNote error', e);
        }
      },

      addAttachment: async (id, att) => {
        const existing = safeArray(get().notes);
        const updated = existing.map((n) =>
          n.id === id ? { ...n, attachments: [...(n.attachments ?? []), att] } : n
        );
        set({ notes: updated });

        try {
          await AsyncStorage.setItem('notes', JSON.stringify(updated));
        } catch (e) {
          console.error('persist addAttachment error', e);
        }
      },

      removeAttachment: async (id, attachmentId) => {
        const existing = safeArray(get().notes);
        const updated = existing.map((n) =>
          n.id === id
            ? {
                ...n,
                attachments: (n.attachments ?? []).filter((a) => a.id !== attachmentId),
              }
            : n
        );
        set({ notes: updated });

        try {
          await AsyncStorage.setItem('notes', JSON.stringify(updated));
        } catch (e) {
          console.error('persist removeAttachment error', e);
        }
      },

      clearAllNotes: async () => {
        set({ notes: [] });
        try {
          await AsyncStorage.removeItem('notes');
        } catch (e) {
          console.error('persist clearAllNotes error', e);
        }
      },
    }),
    {
      name: 'notes',
      getStorage: () => AsyncStorage,
    }
  )
);
