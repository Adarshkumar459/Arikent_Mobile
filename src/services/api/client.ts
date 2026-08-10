import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { MOBILE_CONFIG } from '../../config/env';
import { AuthRepository } from '../../repositories/AuthRepository';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export interface FormattedApiError {
  status?: number;
  message: string;
  fieldErrors?: Array<{ field: string; message: string }>;
}

export const formatApiError = (error: any): FormattedApiError => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return { message: 'Request timed out. Please check your connection and try again.' };
    }
    return { message: 'No internet connection. Please check your network and try again.' };
  }

  const status = error.response.status;
  const data = error.response.data || {};
  let message = data.message || 'An unexpected error occurred. Please try again.';
  let fieldErrors: Array<{ field: string; message: string }> | undefined = undefined;

  if (Array.isArray(data.errors)) {
    if (data.errors.length > 0 && typeof data.errors[0] === 'object' && data.errors[0].field) {
      fieldErrors = data.errors;
    } else if (data.errors.length > 0 && typeof data.errors[0] === 'string') {
      message = data.errors.join('. ');
    }
  }

  switch (status) {
    case 400:
      if (!data.message) message = 'Validation Error. Please check your inputs.';
      break;
    case 401:
      if (!data.message) message = 'Invalid email or password.';
      break;
    case 403:
      message = 'Access forbidden. You do not have permission to perform this action.';
      break;
    case 409:
      if (!data.message) message = 'An account with this email address already exists.';
      break;
    case 429:
      message = 'Too many requests. Please wait a moment and try again.';
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      message = 'Server is currently unavailable. Please try again later.';
      break;
  }

  return { status, message, fieldErrors };
};

class ApiClient {
  private instance: AxiosInstance;
  private onSessionExpiredCallback?: () => void;

  constructor() {
    this.instance = axios.create({
      baseURL: MOBILE_CONFIG.API_BASE_URL,
      timeout: MOBILE_CONFIG.TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public setOnSessionExpired(callback: () => void) {
    this.onSessionExpiredCallback = callback;
  }

  private setupInterceptors(): void {
    // Request Interceptor: Attach Bearer Token via AuthRepository (SecureStore)
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await AuthRepository.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Auto 401 token refresh queue & Session Expiry
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/login') &&
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({
                resolve: (token: string) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(this.instance(originalRequest));
                },
                reject: (err) => reject(err),
              });
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const refreshToken = await AuthRepository.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const refreshResponse = await axios.post(`${MOBILE_CONFIG.API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            if (refreshResponse.data && refreshResponse.data.success) {
              const { accessToken: newAccess, refreshToken: newRefresh } = refreshResponse.data.data;
              await AuthRepository.saveTokens(newAccess, newRefresh);
              processQueue(null, newAccess);

              originalRequest.headers.Authorization = `Bearer ${newAccess}`;
              return this.instance(originalRequest);
            } else {
              throw new Error('Refresh response invalid');
            }
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            await AuthRepository.clearTokens();
            if (this.onSessionExpiredCallback) {
              this.onSessionExpiredCallback();
            }
            return Promise.reject(refreshErr);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  public post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  public patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  public put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
