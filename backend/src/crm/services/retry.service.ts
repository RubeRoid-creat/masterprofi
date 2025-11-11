import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../logger/logger.service";
import { RetryPolicyService } from "./retry-policy.service";

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: number[];
}

@Injectable()
export class RetryService {
  constructor(
    private readonly logger: LoggerService,
    private readonly retryPolicy: RetryPolicyService
  ) {}

  /**
   * Выполнить функцию с повторными попытками при ошибках
   */
  async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2,
      retryableErrors = [500, 502, 503, 504, 408, 429],
    } = options;

    let lastError: Error;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Проверяем, нужно ли повторять попытку
        const shouldRetry =
          attempt < maxRetries &&
          (retryableErrors.includes(error?.status) ||
            error?.code === "ECONNRESET" ||
            error?.code === "ETIMEDOUT" ||
            error?.message?.includes("timeout"));

        if (!shouldRetry) {
          throw error;
        }

        // Используем RetryPolicy для расчета задержки
        const delay = this.retryPolicy.getNextRetryDelay(attempt);
        const retryInfo = this.retryPolicy.getRetryInfo(attempt, maxRetries);

        this.logger.warn(
          `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms (${retryInfo.delaySeconds}s)`,
          error
        );

        // Ждем перед следующей попыткой
        await this.sleep(delay);

        attempt++;
      }
    }

    throw lastError!;
  }

  /**
   * Задержка выполнения
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}





