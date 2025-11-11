/**
 * CRM Deal Model
 */

import { Model } from '@nozbe/watermelondb';
import { field, writer } from '@nozbe/watermelondb/decorators';

export default class CrmDeal extends Model {
  static table = 'crm_deals';

  @field('server_id') serverId?: string;
  @field('crm_id') crmId?: string;
  @field('crm_type') crmType?: string;
  @field('title') title!: string;
  @field('contact_id') contactId?: string;
  @field('amount') amount!: number;
  @field('currency') currency?: string;
  @field('stage') stage?: string;
  @field('description') description?: string;
  @field('version') version!: number; // Версия для синхронизации
  @field('last_modified') lastModified!: number; // Последнее изменение
  @field('sync_version') syncVersion!: number; // Для обратной совместимости
  @field('last_synced_at') lastSyncedAt?: number;
  @field('is_synced') isSynced!: boolean;
  @field('sync_status') syncStatus?: string; // 'synced' | 'pending' | 'error'
  @field('dirty') dirty!: boolean; // Есть ли локальные изменения
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @writer async updateDeal(updates: Partial<CrmDeal>) {
    await this.update((deal) => {
      Object.assign(deal, updates);
      deal.updatedAt = Date.now();
      deal.version = (deal.version || 1) + 1;
      deal.lastModified = Date.now();
      deal.dirty = true; // Помечаем как измененное локально
      deal.isSynced = false;
      deal.syncStatus = 'pending';
    });
  }

  @writer async markAsSynced() {
    await this.update((deal) => {
      deal.isSynced = true;
      deal.syncStatus = 'synced';
      deal.dirty = false; // Очищаем флаг изменений после синхронизации
      deal.lastSyncedAt = Date.now();
    });
  }
}





