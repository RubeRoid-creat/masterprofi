/**
 * Database Configuration
 * Sets up WatermelonDB with encryption and all models
 * Note: Database is only available on native platforms (iOS/Android)
 * Web platform uses AsyncStorage as an alternative
 */

// Import polyfill for crypto.getRandomValues() before uuid
import 'react-native-get-random-values';

import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import { schema } from './schema';
import { migrations } from './migrations';
import * as models from './models';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import { v4 as uuidv4 } from 'uuid';

// Set custom ID generator (optional, uses UUID for better collision resistance)
setGenerator(() => uuidv4());

let database: Database | null = null;
let adapter: any = null;

// Initialize database only on native platforms (iOS/Android)
// Web platform: database remains null, all database operations will be skipped
if (Platform.OS !== 'web') {
  // Use a function to initialize database lazily
  // This prevents Metro from statically analyzing the require() on web
  const initDatabase = () => {
    try {
      // Only require SQLiteAdapter on native platforms
      // Using dynamic require to prevent web bundler from trying to resolve it
      const adapterPath = '@nozbe/watermelondb/adapters/sqlite';
      const SQLiteAdapterModule = eval(`require('${adapterPath}')`);
      const SQLiteAdapter = SQLiteAdapterModule.default || SQLiteAdapterModule;
      
      // SQLite adapter for Expo
      adapter = new SQLiteAdapter({
        schema,
        migrations,
        dbName: 'masterprofi',
        // For Expo, JSI is disabled by default
        // The adapter will automatically use expo-sqlite when available
        onSetUpError: (error) => {
          console.error('Database setup error:', error);
        },
      });

      // Create database instance
      database = new Database({
        adapter,
        modelClasses: [
          models.Client,
          models.Order,
          models.Message,
          models.Part,
          models.KnowledgeBaseArticle,
          models.SyncStatus,
          models.OrderPhoto,
          models.OrderPart,
          models.CrmContact,
          models.CrmDeal,
          models.CrmTask,
          models.CrmSyncQueue,
        ],
      });
    } catch (error: any) {
      console.warn('Failed to initialize WatermelonDB:', error);
      console.warn('Database features will be disabled.');
      database = null;
      adapter = null;
    }
  };
  
  // Initialize immediately on native platforms
  initDatabase();
} else {
  // Explicitly set to null on web - database is not available
  database = null;
  adapter = null;
}

// Database utilities with web fallback
export const getDatabase = (): Database | null => {
  if (Platform.OS === 'web') {
    console.warn('WatermelonDB is not available on web platform. Use AsyncStorage instead.');
    return null;
  }
  return database;
};

// Helper to reset database (for development)
export const resetDatabase = async (): Promise<void> => {
  if (Platform.OS === 'web' || !database) {
    console.warn('Database reset is not available on web platform.');
    return;
  }
  
  await database.write(async () => {
    await database!.unsafeResetDatabase();
  });
};

// Export database instance (null on web)
export { database };

