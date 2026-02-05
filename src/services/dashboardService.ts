import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api';

export interface DashboardData {
  totalExpenses: number;
  savingsLeft: number;
  monthlySavingsGoal: number;
  upcomingPayments: number;
  expensesByCategory: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    totalAmount: number;
    percentage: number;
  }[];
  expensesByType: {
    type: 'ONE_TIME' | 'RECURRING';
    totalAmount: number;
    count: number;
  }[];
  recentExpenses: {
    id: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    amount: number;
    description: string;
    expenseDate: string;
  }[];
  upcomingItems: {
    id: string;
    name: string;
    categoryName: string;
    categoryIcon: string;
    amount: number;
    dueDate: string;
  }[];
}

export const dashboardService = {
  /**
   * Get dashboard data
   */
  getDashboardData: async (): Promise<ApiResponse<DashboardData>> => {
    return api.get<ApiResponse<DashboardData>>('/dashboard', true);
  },
};
