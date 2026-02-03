import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { ChecklistItem, Alert } from '@/types/expense';
import { Category } from '@/types/category';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { expenseService, ExpenseApiData, CreateExpenseRequest, UpdateExpenseRequest } from '@/services/expenseService';
import { categoryService } from '@/services/categoryService';

interface ExpenseContextType {
  expenses: ExpenseApiData[];
  categories: Category[];
  checklist: ChecklistItem[];
  alerts: Alert[];
  loading: boolean;
  addExpense: (expense: CreateExpenseRequest) => Promise<void>;
  updateExpense: (id: string, expense: UpdateExpenseRequest) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addChecklistItem: (item: Omit<ChecklistItem, 'id' | 'status'>) => void;
  updateChecklistItem: (id: string, item: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (id: string) => void;
  toggleChecklistStatus: (id: string) => void;
  dismissAlert: (id: string) => void;
  totalExpenses: number;
  savingsLeft: number;
  upcomingItems: number;
  refreshExpenses: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Mock data for checklist and alerts (these would also come from API later)
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
  const { user, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseApiData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useLocalStorage<ChecklistItem[]>('smartexpense_checklist', mockChecklist);
  const [alerts, setAlerts] = useLocalStorage<Alert[]>('smartexpense_alerts', mockAlerts);

  const refreshCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, [isAuthenticated]);

  const refreshExpenses = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await expenseService.getExpenses();
      if (response.success && response.data) {
        setExpenses(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCategories();
      refreshExpenses();
    } else {
      setExpenses([]);
      setCategories([]);
    }
  }, [isAuthenticated, refreshCategories, refreshExpenses]);

  const addExpense = async (expense: CreateExpenseRequest) => {
    const response = await expenseService.createExpense(expense);
    if (response.success && response.data) {
      setExpenses(prev => [response.data, ...prev]);
    }
  };

  const updateExpense = async (id: string, updates: UpdateExpenseRequest) => {
    const response = await expenseService.updateExpense(id, updates);
    if (response.success && response.data) {
      setExpenses(prev => prev.map(e => e.id === id ? response.data : e));
    }
  };

  const deleteExpense = async (id: string) => {
    const response = await expenseService.deleteExpense(id);
    if (response.success) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
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
      categories,
      checklist,
      alerts,
      loading,
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
      refreshExpenses,
      refreshCategories,
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
