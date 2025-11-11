/**
 * Helper functions for Orders API
 */

import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { ApiError, NetworkError } from './ordersApi.types';

/**
 * Check if error is API error
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
}

/**
 * Check if error is network error
 */
export function isNetworkError(
  error: unknown
): error is FetchBaseQueryError & NetworkError {
  if (typeof error !== 'object' || error === null) return false;
  
  const fetchError = error as FetchBaseQueryError;
  return (
    fetchError.status === 'FETCH_ERROR' ||
    fetchError.status === 'PARSING_ERROR' ||
    fetchError.status === 'TIMEOUT_ERROR' ||
    fetchError.status === 'OFFLINE'
  );
}

/**
 * Extract error message from error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (isNetworkError(error)) {
    if (error.status === 'OFFLINE') {
      return 'No internet connection. Please check your network.';
    }
    if (error.status === 'FETCH_ERROR') {
      return 'Network error. Please try again.';
    }
    if (error.status === 'TIMEOUT_ERROR') {
      return 'Request timeout. Please try again.';
    }
    return 'An error occurred. Please try again.';
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if order is stale (older than threshold)
 */
export function isOrderStale(lastUpdated: string, thresholdMinutes = 5): boolean {
  const lastUpdatedTime = new Date(lastUpdated).getTime();
  const now = Date.now();
  const threshold = thresholdMinutes * 60 * 1000;
  return now - lastUpdatedTime > threshold;
}

/**
 * Build query params from filters
 */
export function buildOrderQueryParams(params: {
  status?: string;
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
  search?: string;
}): Record<string, string> {
  const queryParams: Record<string, string> = {};

  if (params.status) queryParams.status = params.status;
  if (params.page) queryParams.page = params.page.toString();
  if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
  if (params.search) queryParams.search = params.search;

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams[key] = value.join(',');
        } else {
          queryParams[key] = value.toString();
        }
      }
    });
  }

  return queryParams;
}








