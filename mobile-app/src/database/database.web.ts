/**
 * Database Configuration for Web Platform
 * Web version uses AsyncStorage instead of WatermelonDB
 */

import { Database } from '@nozbe/watermelondb';

// Database is not available on web platform
export const database: Database | null = null;

// Database utilities with web fallback
export const getDatabase = (): Database | null => {
  console.warn('WatermelonDB is not available on web platform. Use AsyncStorage instead.');
  return null;
};

// Helper to reset database (not available on web)
export const resetDatabase = async (): Promise<void> => {
  console.warn('Database reset is not available on web platform.');
};








