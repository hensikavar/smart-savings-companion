import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '@/types/api';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { getAccessToken, clearTokens } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, confirmPassword: string, savingsGoal: number) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; monthlySavingsGoal?: number }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const response = await userService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            clearTokens();
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      }
      
      return { success: false, error: response.message || 'Login failed' };
    } catch (error: any) {
      const message = error.response?.message || error.message || 'Invalid email or password';
      return { success: false, error: message };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    savingsGoal: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.register({
        name,
        email,
        password,
        confirmPassword,
        monthlySavingsGoal: savingsGoal,
      });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      }
      
      return { success: false, error: response.message || 'Registration failed' };
    } catch (error: any) {
      const message = error.response?.message || error.message || 'Registration failed';
      
      // Handle validation errors
      if (error.response?.data && typeof error.response.data === 'object') {
        const validationErrors = Object.values(error.response.data).join(', ');
        return { success: false, error: validationErrors };
      }
      
      return { success: false, error: message };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API fails
      authService.clearAuth();
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (updates: { name?: string; monthlySavingsGoal?: number }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await userService.updateProfile(updates);
      
      if (response.success && response.data) {
        setUser(response.data);
        return { success: true };
      }
      
      return { success: false, error: response.message || 'Update failed' };
    } catch (error: any) {
      const message = error.response?.message || error.message || 'Failed to update profile';
      return { success: false, error: message };
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await userService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
