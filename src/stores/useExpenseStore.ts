import create from 'zustand';
import { Expense } from '../types/expense';
import { saveExpensesToStorage, loadExpensesFromStorage } from '../services/storage';


interface ExpenseState {
expenses: Expense[];
addExpense: (e: Expense) => void;
loadFromStorage: () => Promise<void>;
}


export const useExpenseStore = create<ExpenseState>((set, get) => ({
expenses: [],
addExpense: (e) => {
set((s) => ({ expenses: [e, ...s.expenses] }));
saveExpensesToStorage([e, ...get().expenses]);
},
loadFromStorage: async () => {
const items = await loadExpensesFromStorage();
set({ expenses: items });
},
}));