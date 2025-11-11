/**
 * Logger Utility
 * Environment-aware logging service
 */

import { config } from '../config/environments';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (!config.enableLogging) {
      return false;
    }

    // In production, only log warnings and errors
    if (config.environment === 'production') {
      return level === 'warn' || level === 'error';
    }

    return true;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
  }

  /**
   * Log API request
   */
  logApiRequest(method: string, url: string, data?: any): void {
    if (this.shouldLog('debug')) {
      this.debug(`API Request: ${method} ${url}`, data);
    }
  }

  /**
   * Log API response
   */
  logApiResponse(method: string, url: string, status: number, data?: any): void {
    if (this.shouldLog('debug')) {
      this.debug(`API Response: ${method} ${url} ${status}`, data);
    }
  }

  /**
   * Log API error
   */
  logApiError(method: string, url: string, error: Error): void {
    this.error(`API Error: ${method} ${url}`, error);
  }
}

export const logger = new Logger();








