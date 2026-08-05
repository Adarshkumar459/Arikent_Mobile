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

    // Response Interceptor: Auto 401 token refresh queue
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
