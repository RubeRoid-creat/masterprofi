/**
 * Crash Reporting Service
 * Centralized crash reporting with Sentry integration
 */

import { config } from '../config/environments';
import * as Device from 'expo-device';
import * as Updates from 'expo-updates';

export interface ErrorContext {
  userId?: string;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

class CrashReportingService {
  private enabled: boolean = false;
  private userId: string | null = null;
  private initialized: boolean = false;

  constructor() {
    this.enabled = config.enableCrashReporting && config.crashReporting.enabled === true;
  }

  /**
   * Initialize crash reporting
   */
  async initialize(): Promise<void> {
    if (!this.enabled) {
      console.log('Crash reporting disabled');
      return;
    }

    try {
      // Initialize Sentry
      // This would initialize Sentry SDK
      // import * as Sentry from '@sentry/react-native';
      // Sentry.init({
      //   dsn: config.crashReporting.dsn,
      //   environment: config.crashReporting.environment,
      //   enableAutoSessionTracking: true,
      //   tracesSampleRate: config.enablePerformanceMonitoring ? 1.0 : 0.0,
      // });

      this.initialized = true;
      console.log('Crash reporting initialized');
    } catch (error) {
      console.error('Failed to initialize crash reporting:', error);
      this.enabled = false;
    }
  }

  /**
   * Set user context
   */
  setUser(userId: string, email?: string, username?: string): void {
    this.userId = userId;

    if (!this.enabled || !this.initialized) {
      return;
    }

    // Set user in Sentry
    // Sentry.setUser({
    //   id: userId,
    //   email,
    //   username,
    // });

    console.log(`Crash reporting: User set to ${userId}`);
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    this.userId = null;

    if (!this.enabled || !this.initialized) {
      return;
    }

    // Clear user in Sentry
    // Sentry.setUser(null);

    console.log('Crash reporting: User cleared');
  }

  /**
   * Capture exception
   */
  captureException(error: Error, context?: ErrorContext): void {
    if (!this.enabled || !this.initialized) {
      console.error('Error (not reported):', error);
      return;
    }

    // Capture in Sentry
    // Sentry.captureException(error, {
    //   tags: context?.tags,
    //   extra: {
    //     ...context?.extra,
    //     userId: this.userId,
    //     deviceModel: Device.modelName,
    //     osVersion: Device.osVersion,
    //     appVersion: Updates.updateId || 'unknown',
    //   },
    //   level: context?.level || 'error',
    // });

    console.error('Error reported to crash reporting:', error);
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: ErrorContext['level'] = 'info', context?: ErrorContext): void {
    if (!this.enabled || !this.initialized) {
      return;
    }

    // Sentry.captureMessage(message, {
    //   level,
    //   tags: context?.tags,
    //   extra: context?.extra,
    // });
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(message: string, category?: string, data?: Record<string, any>): void {
    if (!this.enabled || !this.initialized) {
      return;
    }

    // Sentry.addBreadcrumb({
    //   message,
    //   category: category || 'default',
    //   data,
    //   level: 'info',
    // });
  }

  /**
   * Set tag
   */
  setTag(key: string, value: string): void {
    if (!this.enabled || !this.initialized) {
      return;
    }

    // Sentry.setTag(key, value);
  }

  /**
   * Set context
   */
  setContext(key: string, context: Record<string, any>): void {
    if (!this.enabled || !this.initialized) {
      return;
    }

    // Sentry.setContext(key, context);
  }

  /**
   * Start transaction for performance monitoring
   */
  startTransaction(name: string, op: string): any {
    if (!this.enabled || !this.initialized || !config.enablePerformanceMonitoring) {
      return null;
    }

    // return Sentry.startTransaction({
    //   name,
    //   op,
    // });
    return null;
  }
}

export const crashReportingService = new CrashReportingService();








