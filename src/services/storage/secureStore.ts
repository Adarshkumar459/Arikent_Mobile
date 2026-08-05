import * as SecureStore from 'expo-secure-store';

export interface SecureStorageProvider {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

class SecureStoreImplementation implements SecureStorageProvider {
  private prefix = 'arkient_sec_';

  async getItem(key: string): Promise<string | null> {
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        return await SecureStore.getItemAsync(this.prefix + key);
      } else {
        console.warn('[SecureStore] Native SecureStore unavailable, fallback mode');
        return null;
      }
    } catch (error) {
      console.error(`[SecureStore] Error reading ${key}:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.setItemAsync(this.prefix + key, value);
      }
    } catch (error) {
      console.error(`[SecureStore] Error writing ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.deleteItemAsync(this.prefix + key);
      }
    } catch (error) {
      console.error(`[SecureStore] Error removing ${key}:`, error);
    }
  }
}

export const secureStore = new SecureStoreImplementation();
