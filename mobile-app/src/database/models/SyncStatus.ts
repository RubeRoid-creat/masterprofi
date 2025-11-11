/**
 * Sync Status Model
 * Tracks synchronization status for each table
 */

import { Model } from '@nozbe/watermelondb';
import { field, writer } from '@nozbe/watermelondb/decorators';

export default class SyncStatus extends Model {
  static table = 'sync_status';

  @field('table_name') tableName!: string;
  @field('last_synced_at') lastSyncedAt!: number;
  @field('last_sync_token') lastSyncToken?: string;
  @field('pending_changes') pendingChanges?: number;
  @field('sync_error') syncError?: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @writer async updateSyncStatus(
    lastSyncedAt: number,
    lastSyncToken?: string,
    pendingChanges?: number,
    syncError?: string
  ) {
    await this.update((status) => {
      status.lastSyncedAt = lastSyncedAt;
      if (lastSyncToken !== undefined) status.lastSyncToken = lastSyncToken;
      if (pendingChanges !== undefined) status.pendingChanges = pendingChanges;
      if (syncError !== undefined) status.syncError = syncError;
      status.updatedAt = Date.now();
    });
  }

  @writer async clearError() {
    await this.update((status) => {
      status.syncError = undefined;
      status.updatedAt = Date.now();
    });
  }
}








