import { apiClient } from './client';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  timezone?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordResponse {
  devResetToken?: string;
  otpCode?: string;
}

export const authApi = {
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    apiClient.post<{ success: boolean; message: string; data: AuthResponse }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<{ success: boolean; message: string; data: AuthResponse }>('/auth/login', data),

  refresh: (refreshToken: string) =>
    apiClient.post<{ success: boolean; message: string; data: TokenRefreshResponse }>('/auth/refresh', {
      refreshToken,
    }),

  logout: (refreshToken?: string) =>
    apiClient.post<{ success: boolean; message: string }>('/auth/logout', { refreshToken }),

  getMe: () =>
    apiClient.get<{ success: boolean; message: string; data: { user: UserProfile } }>('/auth/me'),

  updateProfile: (data: { name?: string; email?: string; phone?: string; avatar?: string; timezone?: string }) =>
    apiClient.patch<{ success: boolean; message: string; data: { user: UserProfile } }>('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    apiClient.patch<{ success: boolean; message: string }>('/auth/me/password', data),

  deleteAccount: () =>
    apiClient.delete<{ success: boolean; message: string }>('/auth/me'),

  forgotPassword: (email: string) =>
    apiClient.post<{ success: boolean; message: string; data?: ForgotPasswordResponse }>(
      '/auth/forgot-password',
      { email }
    ),

  resetPassword: (data: { token: string; password: string }) =>
    apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', data),
};
