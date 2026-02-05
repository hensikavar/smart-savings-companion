import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { Category } from '@/types/category';
import { useAuth } from './AuthContext';
import { expenseService, ExpenseApiData, CreateExpenseRequest, UpdateExpenseRequest } from '@/services/expenseService';
import { categoryService } from '@/services/categoryService';
import { checklistService, ChecklistApiData, CreateChecklistRequest, UpdateChecklistRequest } from '@/services/checklistService';
import { alertService, AlertApiData } from '@/services/alertService';

interface ExpenseContextType {
  expenses: ExpenseApiData[];
  categories: Category[];
  checklist: ChecklistApiData[];
  alerts: AlertApiData[];
  loading: boolean;
  checklistLoading: boolean;
  alertsLoading: boolean;
  addExpense: (expense: CreateExpenseRequest) => Promise<void>;
  updateExpense: (id: string, expense: UpdateExpenseRequest) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addChecklistItem: (item: CreateChecklistRequest) => Promise<void>;
  updateChecklistItem: (id: string, item: UpdateChecklistRequest) => Promise<void>;
  deleteChecklistItem: (id: string) => Promise<void>;
  toggleChecklistStatus: (id: string) => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;
  markAlertSeen: (id: string) => Promise<void>;
  markAllAlertsSeen: () => Promise<void>;
  totalExpenses: number;
  savingsLeft: number;
  upcomingItems: number;
  unreadAlertsCount: number;
  refreshExpenses: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshChecklist: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseApiData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [checklist, setChecklist] = useState<ChecklistApiData[]>([]);
  const [alerts, setAlerts] = useState<AlertApiData[]>([]);
  const [loading, setLoading] = useState(false);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);

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

  const refreshChecklist = useCallback(async () => {
    if (!isAuthenticated) return;
    setChecklistLoading(true);
    try {
      const response = await checklistService.getAll();
      if (response.success && response.data) {
        setChecklist(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch checklist:', error);
    } finally {
      setChecklistLoading(false);
    }
  }, [isAuthenticated]);

  const refreshAlerts = useCallback(async () => {
    if (!isAuthenticated) return;
    setAlertsLoading(true);
    try {
      const response = await alertService.getAll();
      if (response.success && response.data) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setAlertsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCategories();
      refreshExpenses();
      refreshChecklist();
      refreshAlerts();
    } else {
      setExpenses([]);
      setCategories([]);
      setChecklist([]);
      setAlerts([]);
    }
  }, [isAuthenticated, refreshCategories, refreshExpenses, refreshChecklist, refreshAlerts]);

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

  const addChecklistItem = async (item: CreateChecklistRequest) => {
    const response = await checklistService.create(item);
    if (response.success && response.data) {
      setChecklist(prev => [...prev, response.data]);
    }
  };

  const updateChecklistItem = async (id: string, updates: UpdateChecklistRequest) => {
    const response = await checklistService.update(id, updates);
    if (response.success && response.data) {
      setChecklist(prev => prev.map(i => i.id === id ? response.data : i));
    }
  };

  const deleteChecklistItem = async (id: string) => {
    const response = await checklistService.delete(id);
    if (response.success) {
      setChecklist(prev => prev.filter(i => i.id !== id));
    }
  };

  const toggleChecklistStatus = async (id: string) => {
    const item = checklist.find(i => i.id === id);
    if (!item) return;
    
    const response = item.status === 'PENDING' 
      ? await checklistService.markCompleted(id)
      : await checklistService.markPending(id);
    
    if (response.success && response.data) {
      setChecklist(prev => prev.map(i => i.id === id ? response.data : i));
    }
  };

  const dismissAlert = async (id: string) => {
    const response = await alertService.dismiss(id);
    if (response.success && response.data) {
      setAlerts(prev => prev.map(a => a.id === id ? response.data : a));
    }
  };

  const markAlertSeen = async (id: string) => {
    const response = await alertService.markSeen(id);
    if (response.success && response.data) {
      setAlerts(prev => prev.map(a => a.id === id ? response.data : a));
    }
  };

  const markAllAlertsSeen = async () => {
    const response = await alertService.markAllSeen();
    if (response.success) {
      setAlerts(prev => prev.map(a => ({ ...a, status: 'SEEN' as const })));
    }
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
    checklist.filter(i => i.status === 'PENDING').length,
    [checklist]
  );

  const unreadAlertsCount = useMemo(() =>
    alerts.filter(a => a.status === 'PENDING').length,
    [alerts]
  );

  return (
    <ExpenseContext.Provider value={{
      expenses,
      categories,
      checklist,
      alerts,
      loading,
      checklistLoading,
      alertsLoading,
      addExpense,
      updateExpense,
      deleteExpense,
      addChecklistItem,
      updateChecklistItem,
      deleteChecklistItem,
      toggleChecklistStatus,
      dismissAlert,
      markAlertSeen,
      markAllAlertsSeen,
      totalExpenses,
      savingsLeft,
      upcomingItems,
      unreadAlertsCount,
      refreshExpenses,
      refreshCategories,
      refreshChecklist,
      refreshAlerts,
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
