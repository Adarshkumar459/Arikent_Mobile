import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, UserProfile } from '../services/api/authApi';
import { AuthRepository } from '../repositories/AuthRepository';
import { apiClient } from '../services/api/client';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; avatar?: string; timezone?: string }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  bootstrapAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const bootstrapAuth = async () => {
    setIsLoading(true);
    try {
      const refreshToken = await AuthRepository.getRefreshToken();
      if (!refreshToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Refresh token pair and fetch user profile
      const refreshRes = await authApi.refresh(refreshToken);
      if (refreshRes.data && refreshRes.data.success) {
        const { accessToken, refreshToken: newRefresh } = refreshRes.data.data;
        await AuthRepository.saveTokens(accessToken, newRefresh);

        const profileRes = await authApi.getMe();
        if (profileRes.data && profileRes.data.success) {
          setUser(profileRes.data.data.user);
        } else {
          await AuthRepository.clearTokens();
          setUser(null);
        }
      } else {
        await AuthRepository.clearTokens();
        setUser(null);
      }
    } catch (error) {
      console.warn('[AuthContext] Bootstrap token refresh failed:', error);
      await AuthRepository.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrapAuth();
    apiClient.setOnSessionExpired(() => {
      setUser(null);
    });
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response.data && response.data.success) {
        const { user: userData, accessToken, refreshToken } = response.data.data;
        await AuthRepository.saveTokens(accessToken, refreshToken);
        setUser(userData);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({ email, password, name });
      if (response.data && response.data.success) {
        const { user: userData, accessToken, refreshToken } = response.data.data;
        await AuthRepository.saveTokens(accessToken, refreshToken);
        setUser(userData);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const refreshToken = await AuthRepository.getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {});
      }
    } finally {
      await AuthRepository.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string; email?: string; avatar?: string; timezone?: string }) => {
    const response = await authApi.updateProfile(data);
    if (response.data && response.data.success) {
      setUser(response.data.data.user);
    } else {
      throw new Error(response.data.message || 'Profile update failed');
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const response = await authApi.changePassword(data);
    if (!response.data || !response.data.success) {
      throw new Error(response.data.message || 'Password change failed');
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      await authApi.deleteAccount();
    } finally {
      await AuthRepository.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        bootstrapAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
