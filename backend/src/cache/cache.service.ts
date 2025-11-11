import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";

export enum CacheKeyPrefix {
  DASHBOARD_STATS = "dashboard:stats",
  MLM_STRUCTURE = "mlm:structure",
  MLM_COMMISSIONS = "mlm:commissions",
  REPORTS = "reports",
  USERS_LIST = "users:list",
  ORDERS_LIST = "orders:list",
  MASTER_PROFILES = "masters:profiles",
  REVIEWS_STATS = "reviews:stats",
  SCHEDULE_SLOTS = "schedule:slots",
}

export enum CacheTTL {
  SHORT = 60, // 1 minute
  MEDIUM = 300, // 5 minutes
  LONG = 1800, // 30 minutes
  VERY_LONG = 3600, // 1 hour
}

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Получить значение из кэша
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      if (!this.cacheManager) {
        return undefined;
      }
      return await this.cacheManager.get<T>(key);
    } catch (error: any) {
      // Не логируем как ошибку, это нормально если кэш недоступен
      if (error?.message?.includes("ECONNREFUSED") || error?.code === "ECONNREFUSED") {
        console.warn(`Redis connection refused for key ${key}, using fallback`);
      }
      return undefined;
    }
  }

  /**
   * Установить значение в кэш
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (!this.cacheManager) {
        return;
      }
      await this.cacheManager.set(key, value, ttl || CacheTTL.MEDIUM);
    } catch (error: any) {
      // Не логируем как критическую ошибку, кэш может быть недоступен
      if (error?.message?.includes("ECONNREFUSED") || error?.code === "ECONNREFUSED") {
        console.warn(`Redis connection refused for key ${key}, skipping cache`);
      }
      // Продолжаем работу без кэша
    }
  }

  /**
   * Удалить значение из кэша
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Удалить все ключи по паттерну
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      const matchingKeys = keys.filter((key) => key.includes(pattern));
      for (const key of matchingKeys) {
        await this.del(key);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Очистить весь кэш
   */
  async reset(): Promise<void> {
    try {
      // Метод reset может не быть доступен во всех реализациях
      const store = (this.cacheManager as any).store;
      if (store && typeof store.reset === "function") {
        await store.reset();
      } else {
        // Альтернатива: удалить все ключи по паттерну
        const keys = await this.getAllKeys();
        for (const key of keys) {
          await this.del(key);
        }
      }
    } catch (error) {
      console.error("Cache reset error:", error);
    }
  }

  /**
   * Получить или установить значение (кэш-попадание или мисс)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== undefined) {
        return cached;
      }
    } catch (error) {
      console.warn(`Cache get error for key ${key}, executing factory:`, error);
    }

    // Если кэш не работает, просто выполняем factory
    try {
      const value = await factory();
      try {
        await this.set(key, value, ttl);
      } catch (setError) {
        console.warn(`Cache set error for key ${key}, but value is ready:`, setError);
        // Возвращаем значение даже если не удалось закэшировать
      }
      return value;
    } catch (factoryError) {
      console.error(`Factory error for key ${key}:`, factoryError);
      throw factoryError;
    }
  }

  /**
   * Получить все ключи (зависит от реализации store)
   */
  private async getAllKeys(): Promise<string[]> {
    try {
      // Redis store может иметь метод keys
      const store = (this.cacheManager as any).store;
      if (store && typeof store.keys === "function") {
        return await store.keys("*");
      }
      return [];
    } catch (error) {
      console.error("Error getting cache keys:", error);
      return [];
    }
  }

  /**
   * Инвалидировать кэш для конкретного модуля
   */
  async invalidateModule(prefix: CacheKeyPrefix): Promise<void> {
    await this.delPattern(prefix);
  }

  /**
   * Инвалидировать кэш статистики
   */
  async invalidateStats(): Promise<void> {
    await this.delPattern(CacheKeyPrefix.DASHBOARD_STATS);
    await this.delPattern(CacheKeyPrefix.REVIEWS_STATS);
  }

  /**
   * Инвалидировать кэш MLM данных
   */
  async invalidateMlm(): Promise<void> {
    await this.delPattern(CacheKeyPrefix.MLM_STRUCTURE);
    await this.delPattern(CacheKeyPrefix.MLM_COMMISSIONS);
  }

  /**
   * Инвалидировать кэш пользователей
   */
  async invalidateUsers(): Promise<void> {
    await this.delPattern(CacheKeyPrefix.USERS_LIST);
  }

  /**
   * Инвалидировать кэш заказов
   */
  async invalidateOrders(): Promise<void> {
    await this.delPattern(CacheKeyPrefix.ORDERS_LIST);
  }
}

