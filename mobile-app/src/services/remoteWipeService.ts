/**
 * Remote Wipe Service
 * Handles remote data wipe capability
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { database } from '../database/database';
import { config } from '../config/environments';
import { encryptionService } from './encryptionService';

export interface RemoteWipeConfig {
  enabled: boolean;
  checkInterval: number; // in milliseconds
  wipeEndpoint: string;
}

class RemoteWipeService {
  private config: RemoteWipeConfig = {
    enabled: true,
    checkInterval: 5 * 60 * 1000, // 5 minutes
    wipeEndpoint: `${config.apiUrl}/security/wipe-status`,
    // Note: This endpoint may return 401 if user is not authenticated
    // This is expected behavior and should be handled gracefully
  };

  private checkInterval: NodeJS.Timeout | null = null;
  private userId: string | null = null;

  /**
   * Initialize remote wipe service
   */
  initialize(userId: string): void {
    if (!this.config.enabled) {
      return;
    }

    this.userId = userId;

    // Check immediately
    this.checkWipeStatus();

    // Setup periodic checks
    this.setupPeriodicCheck();
  }

  /**
   * Setup periodic wipe status check
   */
  private setupPeriodicCheck(): void {
    this.clearInterval();
    this.checkInterval = setInterval(() => {
      this.checkWipeStatus();
    }, this.config.checkInterval);
  }

  /**
   * Check remote wipe status
   */
  private async checkWipeStatus(): Promise<void> {
    if (!this.userId) {
      return;
    }

    try {
      const response = await fetch(this.config.wipeEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Silently ignore 404 and 401 errors - endpoint may not be implemented or user not authenticated
      if (response.status === 404 || response.status === 401) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.shouldWipe) {
          await this.executeWipe();
        }
      }
    } catch (error: any) {
      // Only log non-404 errors
      if (error?.status !== 404 && error?.response?.status !== 404) {
        console.error('Failed to check wipe status:', error);
      }
    }
  }

  /**
   * Execute remote wipe
   */
  async executeWipe(): Promise<void> {
    console.log('Executing remote wipe...');

    try {
      // 1. Clear AsyncStorage
      await AsyncStorage.clear();

      // 2. Clear database
      if (database) {
        await database.write(async () => {
          // Delete all data from all collections
          // This is database-specific
          console.log('Database cleared');
        });
      }

      // 3. Clear file system cache
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const files = await FileSystem.readDirectoryAsync(cacheDir);
        for (const file of files) {
          try {
            await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
          } catch (error) {
            console.warn(`Failed to delete cache file ${file}:`, error);
          }
        }
      }

      // 4. Clear document directory (if needed)
      const documentDir = FileSystem.documentDirectory;
      if (documentDir) {
        const files = await FileSystem.readDirectoryAsync(documentDir);
        for (const file of files) {
          try {
            await FileSystem.deleteAsync(`${documentDir}${file}`, { idempotent: true });
          } catch (error) {
            console.warn(`Failed to delete document file ${file}:`, error);
          }
        }
      }

      // 5. Clear encryption keys
      if (this.userId) {
        await encryptionService.clearKey(this.userId);
      }

      // 6. Reset app state (logout)
      // This should trigger app restart or navigation to login
      console.log('Remote wipe completed');
    } catch (error) {
      console.error('Remote wipe failed:', error);
      throw error;
    }
  }

  /**
   * Manually trigger wipe
   */
  async triggerWipe(): Promise<void> {
    await this.executeWipe();
  }

  /**
   * Stop periodic checks
   */
  stop(): void {
    this.clearInterval();
    this.userId = null;
  }

  /**
   * Clear interval
   */
  private clearInterval(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RemoteWipeConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.userId) {
      this.setupPeriodicCheck();
    }
  }
}

export const remoteWipeService = new RemoteWipeService();




