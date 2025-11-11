/**
 * Base Query with Environment Configuration
 * RTK Query base query with environment-aware configuration
 */

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from '../../config/environments';
import { logger } from '../../utils/logger';
import { crashReportingService } from '../../services/crashReportingService';
import { performanceMonitoringService } from '../../services/performanceMonitoringService';

import { RootState } from '../store';

// Performance polyfill for React Native
const getPerformanceNow = (): number => {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  return Date.now();
};

export const baseQuery = fetchBaseQuery({
  baseUrl: config.apiUrl,
  timeout: config.apiTimeout,
  prepareHeaders: async (headers, { getState }) => {
    // Add auth token if available
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // Add environment header
    headers.set('x-environment', config.environment);
    headers.set('x-app-version', '1.0.0'); // Get from app.json

    return headers;
  },
});

// Wrapper for orders API with /orders prefix and error handling
export const ordersBaseQuery = async (args: any, api: any, extraOptions: any) => {
  const modifiedArgs = typeof args === 'string' 
    ? `/orders${args}`
    : {
        ...args,
        url: `/orders${args.url || ''}`,
      };
  return baseQueryWithErrorHandling(modifiedArgs, api, extraOptions);
};

export const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  const { url, method } = typeof args === 'string' ? { url: args, method: 'GET' } : args;

  // Log request
  logger.logApiRequest(method || 'GET', url);

  // Track API performance
  const startTime = getPerformanceNow();

  try {
    const result = await baseQuery(args, api, extraOptions);
    
    // Track API response time
    const responseTime = getPerformanceNow() - startTime;
    const endpoint = typeof args === 'string' ? args : args.url || url;
    const success = !('error' in result);
    performanceMonitoringService.trackApiResponse(endpoint, responseTime, success);

    // Log response
    if ('error' in result && result.error) {
      const error = result.error as any;
      logger.logApiError(method || 'GET', url, new Error(error.data?.message || 'API Error'));

      // Report to crash reporting if server error
      if (error.status >= 500) {
        crashReportingService.captureException(
          new Error(`API Server Error: ${url}`),
          {
            extra: {
              url,
              method: method || 'GET',
              status: error.status,
              data: error.data,
            },
            level: 'error',
          }
        );
      }
    } else if ('data' in result) {
      logger.logApiResponse(
        method || 'GET',
        url,
        (result as any).meta?.response?.status || 200
      );
    }

    return result;
  } catch (error) {
    logger.logApiError(method || 'GET', url, error as Error);

    crashReportingService.captureException(error as Error, {
      extra: {
        url,
        method: method || 'GET',
      },
      level: 'error',
    });

    throw error;
  }
};

