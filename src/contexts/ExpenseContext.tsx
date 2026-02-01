import React, { createContext, useContext, useMemo } from 'react';
import { Expense, ChecklistItem, Alert } from '@/types/expense';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from './AuthContext';

interface ExpenseContextType {
  expenses: Expense[];
  checklist: ChecklistItem[];
  alerts: Alert[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addChecklistItem: (item: Omit<ChecklistItem, 'id' | 'status'>) => void;
  updateChecklistItem: (id: string, item: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (id: string) => void;
  toggleChecklistStatus: (id: string) => void;
  dismissAlert: (id: string) => void;
  totalExpenses: number;
  savingsLeft: number;
  upcomingItems: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Mock data for demo
const mockExpenses: Expense[] = [
  { id: '1', category: 'Food & Dining', amount: 45.50, type: 'one-time', description: 'Lunch at restaurant', date: '2026-01-28' },
  { id: '2', category: 'Transportation', amount: 30.00, type: 'recurring', description: 'Weekly gas', date: '2026-01-27', recurrence: 'weekly' },
  { id: '3', category: 'Bills & Utilities', amount: 150.00, type: 'recurring', description: 'Electricity bill', date: '2026-01-25', recurrence: 'monthly' },
  { id: '4', category: 'Entertainment', amount: 15.99, type: 'recurring', description: 'Netflix subscription', date: '2026-01-20', recurrence: 'monthly' },
  { id: '5', category: 'Shopping', amount: 89.99, type: 'one-time', description: 'New headphones', date: '2026-01-18' },
  { id: '6', category: 'Healthcare', amount: 50.00, type: 'one-time', description: 'Doctor visit copay', date: '2026-01-15' },
];

const mockChecklist: ChecklistItem[] = [
  { id: '1', name: 'Rent Payment', category: 'Bills & Utilities', amount: 1200, dueDate: '2026-02-01', status: 'pending' },
  { id: '2', name: 'Internet Bill', category: 'Bills & Utilities', amount: 60, dueDate: '2026-02-05', status: 'pending' },
  { id: '3', name: 'Gym Membership', category: 'Personal Care', amount: 40, dueDate: '2026-02-10', status: 'pending' },
  { id: '4', name: 'Car Insurance', category: 'Transportation', amount: 120, dueDate: '2026-02-15', status: 'completed' },
];

const mockAlerts: Alert[] = [
  { id: '1', message: 'You have spent 75% of your monthly savings goal', date: '2026-01-30', status: 'pending', type: 'warning' },
  { id: '2', message: 'Rent payment due in 2 days', date: '2026-01-30', status: 'pending', type: 'info' },
];

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('smartexpense_expenses', mockExpenses);
  const [checklist, setChecklist] = useLocalStorage<ChecklistItem[]>('smartexpense_checklist', mockChecklist);
  const [alerts, setAlerts] = useLocalStorage<Alert[]>('smartexpense_alerts', mockAlerts);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: crypto.randomUUID() };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addChecklistItem = (item: Omit<ChecklistItem, 'id' | 'status'>) => {
    const newItem: ChecklistItem = { ...item, id: crypto.randomUUID(), status: 'pending' };
    setChecklist(prev => [...prev, newItem]);
  };

  const updateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    setChecklist(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(i => i.id !== id));
  };

  const toggleChecklistStatus = (id: string) => {
    setChecklist(prev => prev.map(i => 
      i.id === id ? { ...i, status: i.status === 'pending' ? 'completed' : 'pending' } : i
    ));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'seen' } : a));
  };

  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const savingsLeft = useMemo(() => 
    (user?.monthlySavingsGoal || 3000) - totalExpenses,
    [user?.monthlySavingsGoal, totalExpenses]
  );

  const upcomingItems = useMemo(() => 
    checklist.filter(i => i.status === 'pending').length,
    [checklist]
  );

  return (
    <ExpenseContext.Provider value={{
      expenses,
      checklist,
      alerts,
      addExpense,
      updateExpense,
      deleteExpense,
      addChecklistItem,
      updateChecklistItem,
      deleteChecklistItem,
      toggleChecklistStatus,
      dismissAlert,
      totalExpenses,
      savingsLeft,
      upcomingItems,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
