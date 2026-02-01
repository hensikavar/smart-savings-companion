export interface Expense {
  id: string;
  category: string;
  amount: number;
  type: 'one-time' | 'recurring';
  description: string;
  date: string;
  recurrence?: 'weekly' | 'monthly';
}

export interface ChecklistItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'completed';
}

export interface Alert {
  id: string;
  message: string;
  date: string;
  status: 'pending' | 'seen';
  type: 'warning' | 'danger' | 'info';
}

export interface User {
  id: string;
  name: string;
  email: string;
  monthlySavingsGoal: number;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
