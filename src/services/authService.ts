import { api, setTokens, clearTokens, getRefreshToken } from '@/lib/api';
import {
  ApiResponse,
  AuthTokens,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
} from '@/types/api';

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthTokens>> => {
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/register', data);
    
    if (response.success && response.data) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response;
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<ApiResponse<AuthTokens>> => {
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/login', data);
    
    if (response.success && response.data) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response;
  },

  /**
   * Refresh the access token
   */
  refreshToken: async (): Promise<ApiResponse<AuthTokens>> => {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data: RefreshTokenRequest = { refreshToken };
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh-token', data);
    
    if (response.success && response.data) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response;
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post<ApiResponse<null>>('/users/logout', undefined, true);
      clearTokens();
      return response;
    } catch (error) {
      // Clear tokens even if API call fails
      clearTokens();
      throw error;
    }
  },

  /**
   * Clear local auth state (for when API logout fails)
   */
  clearAuth: (): void => {
    clearTokens();
  },
};
