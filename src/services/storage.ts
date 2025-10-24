import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense';


const EXPENSES_KEY = '@app_expenses_v1';


export const saveExpensesToStorage = async (items: Expense[]) => {
try {
await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(items));
} catch (e) {
console.warn('Failed saving expenses', e);
}
};


export const loadExpensesFromStorage = async (): Promise<Expense[]> => {
try {
const raw = await AsyncStorage.getItem(EXPENSES_KEY);
if (!raw) return [];
return JSON.parse(raw) as Expense[];
} catch (e) {
console.warn('Failed loading expenses', e);
return [];
}
};