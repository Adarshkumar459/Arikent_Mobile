import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalStorageProvider {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

class LocalStorageImplementation implements LocalStorageProvider {
  private prefix = '@arkient_local_';

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(this.prefix + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
      console.error(`[LocalStorage] Error reading ${key}:`, error);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const raw = JSON.stringify(value);
      await AsyncStorage.setItem(this.prefix + key, raw);
    } catch (error) {
      console.error(`[LocalStorage] Error writing ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`[LocalStorage] Error removing ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('[LocalStorage] Error clearing storage:', error);
    }
  }
}

export const localStorage = new LocalStorageImplementation();
