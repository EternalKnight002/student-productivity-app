// src/services/notesCleanup.ts
import * as FileSystem from 'expo-file-system';
import { loadNotes } from './notesStorage';

export const cleanupOrphanedFiles = async (): Promise<void> => {
  try {
    const notes = await loadNotes();
    const referenced = new Set<string>();
    for (const n of notes) {
      for (const a of n.attachments ?? []) {
        referenced.add(a.uri);
      }
    }

    const notesDir = (FileSystem as any).documentDirectory ? `${(FileSystem as any).documentDirectory}notes/` : ((FileSystem as any).cacheDirectory ? `${(FileSystem as any).cacheDirectory}notes/` : null);
    if (!notesDir) return;

    const dirInfo = await FileSystem.getInfoAsync(notesDir);
    if (!dirInfo.exists) return;

    const listing = await FileSystem.readDirectoryAsync(notesDir);
    for (const fname of listing) {
      const full = `${notesDir}${fname}`;
      if (!referenced.has(full)) {
        try {
          await FileSystem.deleteAsync(full, { idempotent: true });
          // optionally log
          // console.log('Deleted orphaned file', full);
        } catch (e) {
          console.warn('cleanup delete failed', full, e);
        }
      }
    }
  } catch (e) {
    console.warn('cleanupOrphanedFiles error', e);
  }
};
