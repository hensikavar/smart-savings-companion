// API Response Types

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  monthlySavingsGoal: number;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: AuthUser;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  monthlySavingsGoal: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  monthlySavingsGoal?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ValidationErrors {
  [key: string]: string;
}
