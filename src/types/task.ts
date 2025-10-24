// src/types/task.ts
export type UUID = string;

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: UUID;
  title: string;
  description?: string;
  dueDate?: string;   // ISO string
  remindAt?: string;  // ISO string (optional for future notifications)
  course?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;  // ISO
  updatedAt?: string; // ISO
}
