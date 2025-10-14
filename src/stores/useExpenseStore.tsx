import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense';

type State = {
  expenses: Expense[];
  addExpense: (e: Expense) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getById: (id: string) => Expense | undefined;
  clearAll: () => void;
};

export const useExpenseStore = create<State>()(
  persist(
    (set, get) => ({
      expenses: [],
      addExpense: (e: Expense) =>
        set((s) => ({ expenses: [e, ...s.expenses] })),
      updateExpense: (id, patch) =>
        set((s) => ({
          expenses: s.expenses.map((x) =>
            x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x
          ),
        })),
      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) })),
      getById: (id) => get().expenses.find((x) => x.id === id),
      clearAll: () => set({ expenses: [] }),
    }),
    {
      name: 'expenses-storage-v1',
      getStorage: () => AsyncStorage,
    }
  )
);