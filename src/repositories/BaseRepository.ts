import { apiClient } from '../services/api/client';
import { localStorage } from '../services/storage/localStorage';

export interface BaseRepositoryConfig {
  cacheKey: string;
}

export abstract class BaseRepository<T extends { id: string }> {
  protected cacheKey: string;

  constructor(config: BaseRepositoryConfig) {
    this.cacheKey = config.cacheKey;
  }

  /**
   * Reads data from local persistent cache (Offline-first baseline).
   */
  public async getCachedData(): Promise<T[] | null> {
    return await localStorage.getItem<T[]>(this.cacheKey);
  }

  /**
   * Persists items to local cache.
   */
  public async setCachedData(data: T[]): Promise<void> {
    await localStorage.setItem<T[]>(this.cacheKey, data);
  }

  /**
   * Clears cached data for this repository.
   */
  public async clearCache(): Promise<void> {
    await localStorage.removeItem(this.cacheKey);
  }

  protected get api() {
    return apiClient;
  }
}
