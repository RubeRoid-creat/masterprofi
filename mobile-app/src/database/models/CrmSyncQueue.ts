/**
 * CRM Sync Queue Model
 * Stores pending changes to be synced with the server
 */

import { Model } from '@nozbe/watermelondb';
import { field, writer } from '@nozbe/watermelondb/decorators';

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncQueueStatus = 'PENDING' | 'SENT' | 'ERROR' | 'PROCESSING';

export default class CrmSyncQueue extends Model {
  static table = 'crm_sync_queue';

  @field('entity_type') entityType!: string;
  @field('entity_id') entityId?: string;
  @field('operation') operation!: SyncOperation;
  @field('payload') payload!: string; // JSON string
  @field('status') status!: SyncQueueStatus;
  @field('retry_count') retryCount!: number;
  @field('error_message') errorMessage?: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
  @field('processed_at') processedAt?: number;

  getPayload(): Record<string, any> {
    try {
      return JSON.parse(this.payload);
    } catch {
      return {};
    }
  }

  @writer async markAsSent() {
    await this.update((item) => {
      item.status = 'SENT';
      item.processedAt = Date.now();
      item.updatedAt = Date.now();
    });
  }

  @writer async markAsError(error: string, incrementRetry: boolean = true) {
    await this.update((item) => {
      item.status = 'ERROR';
      item.errorMessage = error;
      if (incrementRetry) {
        item.retryCount += 1;
      }
      item.updatedAt = Date.now();
    });
  }

  @writer async markAsProcessing() {
    await this.update((item) => {
      item.status = 'PROCESSING';
      item.updatedAt = Date.now();
    });
  }
}





