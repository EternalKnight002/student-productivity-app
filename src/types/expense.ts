export type UUID = string;


export interface Expense {
id: UUID;
amount: number;
category: string;
note?: string;
date: string; // ISO
createdAt: string;
updatedAt?: string;
}