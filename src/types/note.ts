// src/types/note.ts
export type UUID = string;

export interface NoteAttachment {
  id: UUID;
  uri: string; // local file:// path in FileSystem.documentDirectory or remote URL later
  mimeType?: string;
  createdAt: string; // ISO
}

export interface Note {
  id: UUID;
  title: string;
  body: string;
  tags?: string[];
  pinned?: boolean;
  attachments?: NoteAttachment[];
  createdAt: string;
  updatedAt?: string;
}
