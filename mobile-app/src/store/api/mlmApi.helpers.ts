/**
 * Helper functions for MLM API
 */

import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { MLMApiError, NetworkError } from './mlmApi.types';

/**
 * Check if error is MLM API error
 */
export function isMLMApiError(error: unknown): error is MLMApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as MLMApiError).message === 'string'
  );
}

/**
 * Check if error is network error
 */
export function isMLMNetworkError(
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
export function getMLMErrorMessage(error: unknown): string {
  if (isMLMApiError(error)) {
    return error.message;
  }
  
  if (isMLMNetworkError(error)) {
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
 * Calculate commission percentage by level
 */
export function getCommissionPercentage(level: number): number {
  const commissionRates: Record<number, number> = {
    1: 3.0, // 3%
    2: 2.0, // 2%
    3: 1.0, // 1%
  };
  return commissionRates[level] || 0;
}

/**
 * Format commission amount
 */
export function formatCommission(amount: number, currency = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate rank from earnings
 */
export function calculateRank(totalEarnings: number): string {
  if (totalEarnings >= 1000000) return 'Diamond';
  if (totalEarnings >= 500000) return 'Platinum';
  if (totalEarnings >= 200000) return 'Gold';
  if (totalEarnings >= 50000) return 'Silver';
  return 'Bronze';
}

/**
 * Format period for display
 */
export function formatPeriod(period: string): string {
  const periodMap: Record<string, string> = {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    quarter: 'Quarter',
    year: 'Year',
    all: 'All Time',
  };
  return periodMap[period] || period;
}








