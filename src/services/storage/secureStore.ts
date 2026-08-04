import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SecureStorageProvider {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

class SecureStoreImplementation implements SecureStorageProvider {
  private prefix = '@arkient_secure_';

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.prefix + key);
    } catch (error) {
      console.error(`[SecureStore] Error reading ${key}:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.prefix + key, value);
    } catch (error) {
      console.error(`[SecureStore] Error writing ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`[SecureStore] Error removing ${key}:`, error);
    }
  }
}

export const secureStore = new SecureStoreImplementation();
