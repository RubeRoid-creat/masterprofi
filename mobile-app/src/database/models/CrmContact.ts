/**
 * CRM Contact Model
 */

import { Model } from '@nozbe/watermelondb';
import { field, writer } from '@nozbe/watermelondb/decorators';

export default class CrmContact extends Model {
  static table = 'crm_contacts';

  @field('server_id') serverId?: string;
  @field('crm_id') crmId?: string;
  @field('crm_type') crmType?: string;
  @field('name') name!: string;
  @field('phone') phone?: string;
  @field('email') email?: string;
  @field('company') company?: string;
  @field('position') position?: string;
  @field('notes') notes?: string;
  @field('status') status!: string;
  @field('version') version!: number; // Версия для синхронизации
  @field('last_modified') lastModified!: number; // Последнее изменение
  @field('sync_version') syncVersion!: number; // Для обратной совместимости
  @field('last_synced_at') lastSyncedAt?: number;
  @field('is_synced') isSynced!: boolean;
  @field('sync_status') syncStatus?: string; // 'synced' | 'pending' | 'error'
  @field('dirty') dirty!: boolean; // Есть ли локальные изменения
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @writer async updateContact(updates: Partial<CrmContact>) {
    await this.update((contact) => {
      Object.assign(contact, updates);
      contact.updatedAt = Date.now();
      contact.version = (contact.version || 1) + 1;
      contact.lastModified = Date.now();
      contact.dirty = true; // Помечаем как измененное локально
      contact.isSynced = false;
      contact.syncStatus = 'pending';
    });
  }

  @writer async markAsSynced() {
    await this.update((contact) => {
      contact.isSynced = true;
      contact.syncStatus = 'synced';
      contact.dirty = false; // Очищаем флаг изменений после синхронизации
      contact.lastSyncedAt = Date.now();
    });
  }
}





