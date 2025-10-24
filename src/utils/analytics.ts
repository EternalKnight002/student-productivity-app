// src/utils/analytics.ts
import { Expense } from '../types/expense';

/**
 * Returns an object with category -> total amount
 */
export function categoryTotals(expenses: Expense[]) {
  const map: Record<string, number> = {};
  for (const e of expenses) {
    const cat = e.category ?? 'Other';
    map[cat] = (map[cat] || 0) + (e.amount ?? 0);
  }
  return map;
}

/**
 * Returns totals per month for the last `months` months (including current).
 * Keys are ISO 'YYYY-MM' strings. Values are totals.
 */
export function monthlyTotals(expenses: Expense[], months = 6) {
  const now = new Date();
  // build list of months (YYYY-MM) from oldest to newest
  const monthsArr: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthsArr.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const map: Record<string, number> = {};
  for (const key of monthsArr) map[key] = 0;

  for (const e of expenses) {
    const d = new Date(e.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (map[key] !== undefined) map[key] += e.amount ?? 0;
  }

  // return arrays aligned with monthsArr
  return {
    labels: monthsArr.map((k) => {
      const [y, m] = k.split('-');
      const mm = new Date(Number(y), Number(m) - 1, 1);
      return mm.toLocaleString(undefined, { month: 'short' }); // e.g. 'Oct'
    }),
    values: monthsArr.map((k) => map[k] ?? 0),
  };
}

/** small color generator for chart segments */
export function pickColorForIndex(i: number) {
  const palette = [
    '#3751FF', '#06B6D4', '#F97316', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#E11D48'
  ];
  return palette[i % palette.length];
}
