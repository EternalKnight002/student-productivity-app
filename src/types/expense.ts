export type UUID = string;

export interface Expense {
  id: UUID;
  amount: number; // rupees
  category: string;
  note?: string;
  date: string; // ISO string
  createdAt: string;
  updatedAt?: string;
}
