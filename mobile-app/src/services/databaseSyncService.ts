/**
 * Database Sync Service
 * Handles synchronization between local WatermelonDB and remote server
 */

import { database } from '../database/database';
import { Q } from '@nozbe/watermelondb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { SyncStatus } from '../database/models';
import { config } from '../config/environments';

const API_BASE_URL = config.apiUrl;
const SYNC_INTERVAL = 15000; // 15 seconds

export interface SyncOptions {
  tableName?: string;
  force?: boolean;
  onProgress?: (progress: number) => void;
}

export interface ConflictResolution {
  strategy: 'local_wins' | 'server_wins' | 'merge' | 'manual';
  resolve?: (local: any, server: any) => any;
}

class DatabaseSyncService {
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(isSyncing: boolean) => void> = new Set();

  /**
   * Initialize sync service
   */
  async initialize(): Promise<void> {
    // Database is not available on web platform
    if (Platform.OS === 'web' || !database) {
      console.warn('DatabaseSyncService: Database is not available on web platform. Sync disabled.');
      return;
    }

    // Check network status
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await this.syncAll();
    }

    // Listen for network changes
    NetInfo.addEventListener((state) => {
      if (state.isConnected && !this.isSyncing) {
        this.syncAll();
      }
    });

    // Start periodic sync
    this.startPeriodicSync();
  }

  /**
   * Start periodic background sync
   */
  startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && !this.isSyncing) {
        await this.syncAll();
      }
    }, SYNC_INTERVAL);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync all tables
   */
  async syncAll(options: SyncOptions = {}): Promise<void> {
    // Database is not available on web platform
    if (Platform.OS === 'web' || !database) {
      console.warn('DatabaseSyncService: syncAll skipped - database not available on web platform.');
      return;
    }

    if (this.isSyncing && !options.force) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners(true);

    try {
      const tables = ['clients', 'orders', 'messages', 'parts', 'knowledge_base_articles'];

      for (const table of tables) {
        if (!options.tableName || options.tableName === table) {
          await this.syncTable(table as any, options);
        }
      }
    } catch (error) {
      console.error('Error syncing all tables:', error);
    } finally {
      this.isSyncing = false;
      this.notifyListeners(false);
    }
  }

  /**
   * Sync specific table
   */
  async syncTable(
    tableName: 'clients' | 'orders' | 'messages' | 'parts' | 'knowledge_base_articles',
    options: SyncOptions = {}
  ): Promise<void> {
    try {
      // Get sync status
      const syncStatus = await this.getOrCreateSyncStatus(tableName);

      // Pull changes from server
      await this.pullChanges(tableName, syncStatus);

      // Push local changes to server
      await this.pushChanges(tableName, syncStatus);

      // Update sync status
      await this.updateSyncStatus(tableName, Date.now());
    } catch (error) {
      console.error(`Error syncing table ${tableName}:`, error);
      await this.updateSyncStatus(tableName, Date.now(), undefined, undefined, (error as Error).message);
    }
  }

  /**
   * Pull changes from server
   */
  private async pullChanges(tableName: string, syncStatus: SyncStatus): Promise<void> {
    const authToken = await AsyncStorage.getItem('auth_token');
    if (!authToken) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/sync/${tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        lastSyncedAt: syncStatus.lastSyncedAt,
        lastSyncToken: syncStatus.lastSyncToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to pull changes: ${response.statusText}`);
    }

    const data = await response.json();
    const { changes, syncToken } = data;

    // Apply changes to database
    if (!database) {
      throw new Error('Database is not available');
    }
    await database.write(async () => {
      // Process created records
      if (changes.created) {
        for (const record of changes.created) {
          await this.createOrUpdateRecord(tableName, record);
        }
      }

      // Process updated records
      if (changes.updated) {
        for (const record of changes.updated) {
          await this.updateRecord(tableName, record);
        }
      }

      // Process deleted records
      if (changes.deleted) {
        for (const id of changes.deleted) {
          await this.deleteRecord(tableName, id);
        }
      }
    });

    // Update sync token
    await database.write(async () => {
      await syncStatus.update((status) => {
        status.lastSyncToken = syncToken;
        status.updatedAt = Date.now();
      });
    });
  }

  /**
   * Push local changes to server
   */
  private async pushChanges(tableName: string, syncStatus: SyncStatus): Promise<void> {
    if (!database) {
      throw new Error('Database is not available');
    }
    
    // Get pending changes (records with is_synced = false)
    const pendingRecords = await this.getPendingRecords(tableName);

    if (pendingRecords.length === 0) {
      return;
    }

    const authToken = await AsyncStorage.getItem('auth_token');
    if (!authToken) {
      throw new Error('No authentication token');
    }

    // Send changes to server
    const response = await fetch(`${API_BASE_URL}/sync/${tableName}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        changes: pendingRecords.map((record) => ({
          id: record.id,
          serverId: (record as any).serverId,
          data: this.serializeRecord(record),
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to push changes: ${response.statusText}`);
    }

    const data = await response.json();
    const { synced } = data;

    // Mark records as synced
    await database.write(async () => {
      for (const syncedRecord of synced) {
        const record = await this.findRecord(tableName, syncedRecord.localId);
        if (record) {
          await (record as any).markAsSynced(syncedRecord.serverId);
        }
      }
    });

    // Update pending changes count
    await database.write(async () => {
      await syncStatus.update((status) => {
        status.pendingChanges = pendingRecords.length - synced.length;
        status.updatedAt = Date.now();
      });
    });
  }

  /**
   * Get or create sync status for table
   */
  private async getOrCreateSyncStatus(tableName: string): Promise<SyncStatus> {
    if (!database) {
      throw new Error('Database is not available');
    }
    const collection = database.collections.get('sync_status');
    let syncStatus = await collection.query(Q.where('table_name', tableName)).fetch();

    if (syncStatus.length === 0) {
      await database.write(async () => {
        syncStatus = await collection.create((record) => {
          record.tableName = tableName;
          record.lastSyncedAt = 0;
          record.createdAt = Date.now();
          record.updatedAt = Date.now();
        });
      });
      return syncStatus[0];
    }

    return syncStatus[0];
  }

  /**
   * Update sync status
   */
  private async updateSyncStatus(
    tableName: string,
    lastSyncedAt: number,
    lastSyncToken?: string,
    pendingChanges?: number,
    syncError?: string
  ): Promise<void> {
    if (!database) {
      throw new Error('Database is not available');
    }
    const syncStatus = await this.getOrCreateSyncStatus(tableName);
    await database.write(async () => {
      await syncStatus.updateSyncStatus(lastSyncedAt, lastSyncToken, pendingChanges, syncError);
    });
  }

  /**
   * Get pending records
   */
  private async getPendingRecords(tableName: string): Promise<any[]> {
    if (!database) {
      throw new Error('Database is not available');
    }
    const collection = database.collections.get(tableName);
    return await collection.query(Q.where('is_synced', false)).fetch();
  }

  /**
   * Create or update record
   */
  private async createOrUpdateRecord(tableName: string, data: any): Promise<void> {
    if (!database) {
      throw new Error('Database is not available');
    }
    const collection = database.collections.get(tableName);
    const existing = await collection.query(Q.where('server_id', data.id)).fetch();

    if (existing.length > 0) {
      // Update existing
      await database.write(async () => {
        await existing[0].update((record: any) => {
          Object.assign(record, this.deserializeRecord(data, tableName));
          record.isSynced = true;
          record.syncStatus = 'synced';
        });
      });
    } else {
      // Create new
      await database.write(async () => {
        await collection.create((record: any) => {
          Object.assign(record, this.deserializeRecord(data, tableName));
          record.isSynced = true;
          record.syncStatus = 'synced';
        });
      });
    }
  }

  /**
   * Update record
   */
  private async updateRecord(tableName: string, data: any): Promise<void> {
    if (!database) {
      throw new Error('Database is not available');
    }
    const collection = database.collections.get(tableName);
    const existing = await collection.query(Q.where('server_id', data.id)).fetch();

    if (existing.length > 0) {
      await database.write(async () => {
        await existing[0].update((record: any) => {
          Object.assign(record, this.deserializeRecord(data, tableName));
          record.isSynced = true;
          record.syncStatus = 'synced';
        });
      });
    }
  }

  /**
   * Delete record
   */
  private async deleteRecord(tableName: string, serverId: string): Promise<void> {
    if (!database) {
      throw new Error('Database is not available');
    }
    const collection = database.collections.get(tableName);
    const existing = await collection.query(Q.where('server_id', serverId)).fetch();

    if (existing.length > 0) {
      await database.write(async () => {
        await existing[0].destroyPermanently();
      });
    }
  }

  /**
   * Find record by ID
   */
  private async findRecord(tableName: string, id: string): Promise<any> {
    if (!database) {
      return null;
    }
    const collection = database.collections.get(tableName);
    const records = await collection.query(Q.where('id', id)).fetch();
    return records.length > 0 ? records[0] : null;
  }

  /**
   * Serialize record for sending to server
   */
  private serializeRecord(record: any): any {
    const serialized: any = {};
    for (const key in record._raw) {
      if (key !== 'id' && !key.startsWith('_')) {
        serialized[key] = record._raw[key];
      }
    }
    return serialized;
  }

  /**
   * Deserialize record from server
   */
  private deserializeRecord(data: any, tableName: string): any {
    const deserialized: any = {
      serverId: data.id,
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
    };

    // Map server fields to local fields
    const fieldMappings: { [key: string]: { [key: string]: string } } = {
      clients: {
        name: 'name',
        phone: 'phone',
        email: 'email',
        address: 'address',
        avatarUrl: 'avatar_url',
        rating: 'rating',
        notes: 'notes',
      },
      orders: {
        orderNumber: 'order_number',
        status: 'status',
        priority: 'priority',
        applianceType: 'appliance_type',
        applianceBrand: 'appliance_brand',
        applianceModel: 'appliance_model',
        problemDescription: 'problem_description',
        address: 'address',
        latitude: 'latitude',
        longitude: 'longitude',
        distance: 'distance',
        priceAmount: 'price_amount',
        priceCurrency: 'price_currency',
        scheduledAt: 'scheduled_at',
        startedAt: 'started_at',
        completedAt: 'completed_at',
        isNew: 'is_new',
      },
      // Add more mappings as needed
    };

    const mapping = fieldMappings[tableName];
    if (mapping) {
      for (const [localKey, serverKey] of Object.entries(mapping)) {
        if (data[serverKey] !== undefined) {
          deserialized[localKey] = data[serverKey];
        }
      }
    }

    return deserialized;
  }

  /**
   * Add sync listener
   */
  addListener(callback: (isSyncing: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(isSyncing: boolean): void {
    this.listeners.forEach((callback) => {
      try {
        callback(isSyncing);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  /**
   * Resolve conflicts
   */
  async resolveConflict(
    tableName: string,
    localId: string,
    serverData: any,
    strategy: ConflictResolution['strategy'] = 'server_wins',
    customResolver?: ConflictResolution['resolve']
  ): Promise<void> {
    if (!database) {
      throw new Error('Database is not available');
    }
    const record = await this.findRecord(tableName, localId);
    if (!record) {
      return;
    }

    await database.write(async () => {
      if (strategy === 'server_wins') {
        await record.update((r: any) => {
          Object.assign(r, this.deserializeRecord(serverData, tableName));
          r.isSynced = true;
          r.syncStatus = 'synced';
        });
      } else if (strategy === 'local_wins') {
        // Keep local changes, but update sync status
        await record.update((r: any) => {
          r.serverId = serverData.id;
          r.isSynced = false;
          r.syncStatus = 'pending';
        });
      } else if (strategy === 'merge' && customResolver) {
        // Merge local and server data using custom resolver
        const localData = this.serializeRecord(record);
        const merged = customResolver(localData, serverData);
        await record.update((r: any) => {
          Object.assign(r, this.deserializeRecord(merged, tableName));
          r.isSynced = true;
          r.syncStatus = 'synced';
        });
      } else if (strategy === 'manual') {
        // Mark as conflict for manual resolution
        await record.update((r: any) => {
          r.syncStatus = 'conflict';
          r.conflictData = JSON.stringify(serverData);
        });
      }
    });
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    isSyncing: boolean;
    lastSyncTime: Date | null;
    pendingCount: number;
    errorCount: number;
  }> {
    if (!database) {
      return {
        isSyncing: false,
        lastSyncTime: null,
        pendingCount: 0,
        errorCount: 0,
      };
    }

    try {
      const collection = database.collections.get('sync_status');
      const statuses = await collection.query().fetch();
      
      let lastSyncTime: number = 0;
      let pendingCount = 0;
      let errorCount = 0;

      for (const status of statuses) {
        if (status.lastSyncedAt > lastSyncTime) {
          lastSyncTime = status.lastSyncedAt;
        }
        pendingCount += status.pendingChanges || 0;
        if (status.syncError) {
          errorCount++;
        }
      }

      return {
        isSyncing: this.isSyncing,
        lastSyncTime: lastSyncTime > 0 ? new Date(lastSyncTime) : null,
        pendingCount,
        errorCount,
      };
    } catch (error) {
      console.error('Error getting sync stats:', error);
      return {
        isSyncing: false,
        lastSyncTime: null,
        pendingCount: 0,
        errorCount: 0,
      };
    }
  }
}

export const databaseSyncService = new DatabaseSyncService();

