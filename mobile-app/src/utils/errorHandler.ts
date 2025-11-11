/**
 * Global Error Handler
 * Centralized error handling with crash reporting integration
 */

import { ErrorUtils, Platform } from 'react-native';
import { crashReportingService } from '../services/crashReportingService';
import { logger } from './logger';
import { config } from '../config/environments';

class ErrorHandler {
  private originalHandler: ((error: Error, isFatal?: boolean) => void) | null = null;

          /**
           * Initialize error handler
           */
          initialize(): void {
            // ErrorUtils is not fully available on web platform
            if (Platform.OS === 'web') {
              // Use browser's error handlers on web
              if (typeof window !== 'undefined') {
                window.addEventListener('error', (event) => {
                  // Ignore browser extension errors (non-critical)
                  if (event.message?.includes('runtime.lastError') || 
                      event.message?.includes('message port closed') ||
                      event.message?.includes('Extension context invalidated')) {
                    return;
                  }
                  this.handleError(new Error(event.message), false);
                });
                window.addEventListener('unhandledrejection', (event) => {
                  // Ignore browser extension errors
                  const reason = event.reason;
                  if (reason?.message?.includes('runtime.lastError') || 
                      reason?.message?.includes('message port closed') ||
                      reason?.message?.includes('Extension context invalidated')) {
                    return;
                  }
                  this.handlePromiseRejection(reason);
                });
              }
              return;
            }

    // Capture React Native errors (native platforms only)
    try {
      if (ErrorUtils && ErrorUtils.getGlobalHandler) {
        this.originalHandler = ErrorUtils.getGlobalHandler();

        if (ErrorUtils.setGlobalHandler) {
          ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
            this.handleError(error, isFatal);
          });
        }
      }
    } catch (error) {
      console.warn('Error setting up ErrorUtils handler:', error);
    }

    // Capture unhandled promise rejections
    if (typeof global !== 'undefined') {
      const originalRejectionHandler = global.onunhandledrejection;
      global.onunhandledrejection = (event: any) => {
        this.handlePromiseRejection(event.reason);
        if (originalRejectionHandler) {
          originalRejectionHandler(event);
        }
      };
    }
  }

  /**
   * Handle error
   */
  private handleError(error: Error, isFatal?: boolean): void {
    logger.error('Global error handler', error);

    // Report to crash reporting service
    crashReportingService.captureException(error, {
      tags: {
        isFatal: isFatal ? 'true' : 'false',
        environment: config.environment,
      },
      level: isFatal ? 'fatal' : 'error',
    });

    // Call original handler if exists
    if (this.originalHandler) {
      this.originalHandler(error, isFatal);
    }
  }

  /**
   * Handle unhandled promise rejection
   */
  private handlePromiseRejection(reason: any): void {
    const error = reason instanceof Error 
      ? reason 
      : new Error(`Unhandled promise rejection: ${String(reason)}`);

    logger.error('Unhandled promise rejection', error);

    crashReportingService.captureException(error, {
      tags: {
        type: 'promise_rejection',
        environment: config.environment,
      },
      level: 'error',
    });
  }

  /**
   * Wrap async function with error handling
   */
  wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T
  ): T {
    return (async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        if (error instanceof Error) {
          crashReportingService.captureException(error, {
            extra: {
              function: fn.name,
              args: JSON.stringify(args),
            },
          });
        }
        throw error;
      }
    }) as T;
  }
}

export const errorHandler = new ErrorHandler();

