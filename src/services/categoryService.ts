import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { Category } from '@/types/category';

export const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return api.get<ApiResponse<Category[]>>('/categories', true);
  },
};
