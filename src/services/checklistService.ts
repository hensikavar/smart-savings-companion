import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api';

export interface ChecklistApiData {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED';
  isActive: boolean;
  createdAt: string;
}

export interface CreateChecklistRequest {
  name: string;
  categoryId: string;
  amount: number;
  dueDate: string;
}

export interface UpdateChecklistRequest {
  name?: string;
  categoryId?: string;
  amount?: number;
  dueDate?: string;
}

export const checklistService = {
  /**
   * Get all checklist items
   */
  getAll: async (): Promise<ApiResponse<ChecklistApiData[]>> => {
    return api.get<ApiResponse<ChecklistApiData[]>>('/checklist', true);
  },

  /**
   * Get checklist item by ID
   */
  getById: async (id: string): Promise<ApiResponse<ChecklistApiData>> => {
    return api.get<ApiResponse<ChecklistApiData>>(`/checklist/${id}`, true);
  },

  /**
   * Get pending checklist items
   */
  getPending: async (): Promise<ApiResponse<ChecklistApiData[]>> => {
    return api.get<ApiResponse<ChecklistApiData[]>>('/checklist/pending', true);
  },

  /**
   * Get upcoming checklist items
   */
  getUpcoming: async (): Promise<ApiResponse<ChecklistApiData[]>> => {
    return api.get<ApiResponse<ChecklistApiData[]>>('/checklist/upcoming', true);
  },

  /**
   * Create a new checklist item
   */
  create: async (data: CreateChecklistRequest): Promise<ApiResponse<ChecklistApiData>> => {
    return api.post<ApiResponse<ChecklistApiData>>('/checklist', data, true);
  },

  /**
   * Update a checklist item
   */
  update: async (id: string, data: UpdateChecklistRequest): Promise<ApiResponse<ChecklistApiData>> => {
    return api.put<ApiResponse<ChecklistApiData>>(`/checklist/${id}`, data, true);
  },

  /**
   * Mark checklist item as completed
   */
  markCompleted: async (id: string): Promise<ApiResponse<ChecklistApiData>> => {
    return api.patch<ApiResponse<ChecklistApiData>>(`/checklist/${id}/complete`, undefined, true);
  },

  /**
   * Mark checklist item as pending
   */
  markPending: async (id: string): Promise<ApiResponse<ChecklistApiData>> => {
    return api.patch<ApiResponse<ChecklistApiData>>(`/checklist/${id}/pending`, undefined, true);
  },

  /**
   * Delete a checklist item
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(`/checklist/${id}`, true);
  },
};
