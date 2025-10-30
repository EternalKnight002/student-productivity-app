// src/types/note.ts

export type NoteAttachment = {
  id: string;
  uri: string;
  mimeType: string;
  createdAt: string;
};

export interface Note {
  id: string;
  title: string;
  body: string;
  attachments: NoteAttachment[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  pinned?: boolean;
}
