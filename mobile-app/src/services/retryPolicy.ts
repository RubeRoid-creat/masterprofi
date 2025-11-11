/**
 * Retry Policy
 * Реализует экспоненциальную задержку для повторов
 * Формула: min(2^retryCount * 1000, 300000) миллисекунд
 * Максимальная задержка: 300 секунд (5 минут)
 */

class RetryPolicy {
  private readonly maxDelayMs = 300000; // 300 секунд (5 минут)
  private readonly baseDelayMs = 1000; // 1 секунда

  /**
   * Получить задержку до следующей попытки
   * @param retryCount - количество уже выполненных попыток (начинается с 0)
   * @returns задержка в миллисекундах
   */
  getNextRetryDelay(retryCount: number): number {
    // Формула: 2^retryCount * 1000 миллисекунд
    // Примеры:
    // retryCount = 0: 2^0 * 1000 = 1 * 1000 = 1000ms (1 секунда)
    // retryCount = 1: 2^1 * 1000 = 2 * 1000 = 2000ms (2 секунды)
    // retryCount = 2: 2^2 * 1000 = 4 * 1000 = 4000ms (4 секунды)
    // retryCount = 3: 2^3 * 1000 = 8 * 1000 = 8000ms (8 секунд)
    // retryCount = 8: 2^8 * 1000 = 256 * 1000 = 256000ms (256 секунд)
    // retryCount = 9: 2^9 * 1000 = 512 * 1000 = 512000ms -> ограничено 300000ms (5 минут)
    const exponentialDelay = Math.pow(2, retryCount) * this.baseDelayMs;
    
    // Ограничиваем максимальной задержкой
    return Math.min(exponentialDelay, this.maxDelayMs);
  }

  /**
   * Получить задержку в секундах (для удобства)
   */
  getNextRetryDelaySeconds(retryCount: number): number {
    return this.getNextRetryDelay(retryCount) / 1000;
  }

  /**
   * Проверить, нужно ли делать повторную попытку
   * @param retryCount - текущее количество попыток
   * @param maxRetries - максимальное количество попыток
   */
  shouldRetry(retryCount: number, maxRetries: number = 10): boolean {
    return retryCount < maxRetries;
  }

  /**
   * Получить информацию о следующей попытке
   */
  getRetryInfo(retryCount: number, maxRetries: number = 10) {
    const delay = this.getNextRetryDelay(retryCount);
    const canRetry = this.shouldRetry(retryCount, maxRetries);

    return {
      retryCount: retryCount + 1,
      delayMs: delay,
      delaySeconds: delay / 1000,
      canRetry,
      nextRetryAt: canRetry ? new Date(Date.now() + delay) : null,
    };
  }

  /**
   * Задержка выполнения
   */
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const retryPolicy = new RetryPolicy();

