import { secureStore } from '../services/storage/secureStore';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthRepository {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';

  public static async getAccessToken(): Promise<string | null> {
    return secureStore.getItem(this.ACCESS_TOKEN_KEY);
  }

  public static async getRefreshToken(): Promise<string | null> {
    return secureStore.getItem(this.REFRESH_TOKEN_KEY);
  }

  public static async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await secureStore.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    await secureStore.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  public static async clearTokens(): Promise<void> {
    await secureStore.removeItem(this.ACCESS_TOKEN_KEY);
    await secureStore.removeItem(this.REFRESH_TOKEN_KEY);
  }
}
