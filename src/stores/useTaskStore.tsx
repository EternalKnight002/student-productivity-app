// src/stores/useTaskStore.tsx
import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskPriority, TaskStatus } from '../types/task';
import { v4 as uuidv4 } from 'uuid';

type State = {
  tasks: Task[];
  addTask: (payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, patch: Partial<Task>) => Task | undefined;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  getById: (id: string) => Task | undefined;
  clearAll: () => void;
};

const initialTasks: Task[] = [];

export const useTaskStore = create<State>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,

      addTask: (payload) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          id: uuidv4(),
          title: payload.title,
          description: payload.description,
          dueDate: payload.dueDate,
          remindAt: payload.remindAt,
          course: payload.course,
          priority: (payload.priority || 'medium') as TaskPriority,
          status: (payload.status || 'todo') as TaskStatus,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return newTask;
      },

      updateTask: (id, patch) => {
        let updated: Task | undefined;
        set((state) => {
          const tasks = state.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
          );
          updated = tasks.find((t) => t.id === id);
          return { tasks };
        });
        return updated;
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      toggleComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done', updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      getById: (id) => {
        return get().tasks.find((t) => t.id === id);
      },

      clearAll: () => set({ tasks: [] }),
    }),
    {
      name: 'task-store-v1', // storage key
      getStorage: () => AsyncStorage,
    }
  )
);
