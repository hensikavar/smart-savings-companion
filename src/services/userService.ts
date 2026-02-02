import { api } from '@/lib/api';
import { ApiResponse, AuthUser, UpdateProfileRequest } from '@/types/api';

export const userService = {
  /**
   * Get the current authenticated user
   */
  getCurrentUser: async (): Promise<ApiResponse<AuthUser>> => {
    return api.get<ApiResponse<AuthUser>>('/users/me', true);
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<AuthUser>> => {
    return api.put<ApiResponse<AuthUser>>('/users/profile', data, true);
  },
};
