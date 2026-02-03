import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api';

export interface ExpenseApiData {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  description: string;
  expenseDate: string;
  expenseType: 'ONE_TIME' | 'RECURRING';
  recurrenceType: 'WEEKLY' | 'MONTHLY' | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateExpenseRequest {
  categoryId: string;
  amount: number;
  description: string;
  expenseDate: string;
  expenseType: 'ONE_TIME' | 'RECURRING';
  recurrenceType?: 'WEEKLY' | 'MONTHLY' | null;
}

export interface UpdateExpenseRequest {
  categoryId?: string;
  amount?: number;
  description?: string;
  expenseDate?: string;
  expenseType?: 'ONE_TIME' | 'RECURRING';
  recurrenceType?: 'WEEKLY' | 'MONTHLY' | null;
}

export const expenseService = {
  /**
   * Get all expenses
   */
  getExpenses: async (): Promise<ApiResponse<ExpenseApiData[]>> => {
    return api.get<ApiResponse<ExpenseApiData[]>>('/expenses', true);
  },

  /**
   * Create a new expense
   */
  createExpense: async (data: CreateExpenseRequest): Promise<ApiResponse<ExpenseApiData>> => {
    return api.post<ApiResponse<ExpenseApiData>>('/expenses', data, true);
  },

  /**
   * Update an expense
   */
  updateExpense: async (id: string, data: UpdateExpenseRequest): Promise<ApiResponse<ExpenseApiData>> => {
    return api.put<ApiResponse<ExpenseApiData>>(`/expenses/${id}`, data, true);
  },

  /**
   * Delete an expense
   */
  deleteExpense: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(`/expenses/${id}`, true);
  },
};
