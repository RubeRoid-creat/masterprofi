/**
 * CRM Task Model
 */

import { Model } from '@nozbe/watermelondb';
import { field, writer } from '@nozbe/watermelondb/decorators';

export default class CrmTask extends Model {
  static table = 'crm_tasks';

  @field('server_id') serverId?: string;
  @field('crm_id') crmId?: string;
  @field('crm_type') crmType?: string;
  @field('title') title!: string;
  @field('description') description?: string;
  @field('related_entity_id') relatedEntityId?: string;
  @field('related_entity_type') relatedEntityType?: string;
  @field('due_date') dueDate?: number;
  @field('status') status!: string;
  @field('assigned_to_user_id') assignedToUserId?: string;
  @field('contact_id') contactId?: string;
  @field('deal_id') dealId?: string;
  @field('version') version!: number; // Версия для синхронизации
  @field('last_modified') lastModified!: number; // Последнее изменение
  @field('sync_version') syncVersion!: number;
  @field('last_synced_at') lastSyncedAt?: number;
  @field('is_synced') isSynced!: boolean;
  @field('sync_status') syncStatus?: string; // 'synced' | 'pending' | 'error'
  @field('dirty') dirty!: boolean; // Есть ли локальные изменения
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @writer async updateTask(updates: Partial<CrmTask>) {
    await this.update((task) => {
      Object.assign(task, updates);
      task.updatedAt = Date.now();
      task.version = (task.version || 1) + 1;
      task.lastModified = Date.now();
      task.dirty = true; // Помечаем как измененное локально
      task.isSynced = false;
      task.syncStatus = 'pending';
    });
  }

  @writer async markAsSynced() {
    await this.update((task) => {
      task.isSynced = true;
      task.syncStatus = 'synced';
      task.dirty = false; // Очищаем флаг изменений после синхронизации
      task.lastSyncedAt = Date.now();
    });
  }
}





