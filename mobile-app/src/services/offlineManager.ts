/**
 * Offline Manager
 * Handles saving changes offline and queuing them for sync
 * Similar to Kotlin OfflineManager example
 */

import { Platform } from 'react-native';
import { database } from '../database/database';
import { Q } from '@nozbe/watermelondb';
import CrmContact from '../database/models/CrmContact';
import CrmDeal from '../database/models/CrmDeal';
import CrmTask from '../database/models/CrmTask';
import CrmSyncQueue, { SyncOperation } from '../database/models/CrmSyncQueue';
import { crmSyncService } from './crmSyncService';

export type SyncEntity = CrmContact | CrmDeal | CrmTask;

export interface SaveChangeOptions {
  entity: SyncEntity;
  operation: SyncOperation;
  entityType: 'contact' | 'deal' | 'task';
}

class OfflineManager {
  /**
   * Сохранить изменение офлайн
   * Устанавливает syncStatus = "pending" и dirty = true
   * Добавляет в очередь для отправки
   */
  async saveChangeOffline(options: SaveChangeOptions): Promise<void> {
    if (Platform.OS === 'web' || !database) {
      console.warn('OfflineManager: Database is not available on web platform.');
      return;
    }

    const { entity, operation, entityType } = options;

    try {
      await database.write(async () => {
        // Обновляем сущность с флагами синхронизации
        // Для UPDATE операций методы updateContact/updateDeal/updateTask уже устанавливают dirty и syncStatus
        // Для CREATE и DELETE операций устанавливаем флаги вручную
        if (operation === 'UPDATE') {
          // Для UPDATE операций используем существующие методы, которые уже устанавливают dirty и syncStatus
          if (entity instanceof CrmContact) {
            await (entity as CrmContact).updateContact({});
          } else if (entity instanceof CrmDeal) {
            await (entity as CrmDeal).updateDeal({});
          } else if (entity instanceof CrmTask) {
            await (entity as CrmTask).updateTask({});
          }
        } else {
          // Для CREATE и DELETE операций устанавливаем флаги вручную
          if (entity instanceof CrmContact) {
            await (entity as CrmContact).update((contact) => {
              contact.syncStatus = 'pending';
              contact.dirty = true;
              contact.isSynced = false;
              contact.updatedAt = Date.now();
              if (operation === 'CREATE') {
                contact.version = contact.version || 1;
                contact.lastModified = Date.now();
              }
            });
          } else if (entity instanceof CrmDeal) {
            await (entity as CrmDeal).update((deal) => {
              deal.syncStatus = 'pending';
              deal.dirty = true;
              deal.isSynced = false;
              deal.updatedAt = Date.now();
              if (operation === 'CREATE') {
                deal.version = deal.version || 1;
                deal.lastModified = Date.now();
              }
            });
          } else if (entity instanceof CrmTask) {
            await (entity as CrmTask).update((task) => {
              task.syncStatus = 'pending';
              task.dirty = true;
              task.isSynced = false;
              task.updatedAt = Date.now();
              if (operation === 'CREATE') {
                task.version = task.version || 1;
                task.lastModified = Date.now();
              }
            });
          }
        }

        // Создаем запись в очереди синхронизации
        const queueCollection = database.collections.get<CrmSyncQueue>('crm_sync_queue');
        const payload = this.entityToPayload(entity, entityType);

        // Проверяем, нет ли уже записи для этой сущности с операцией PENDING
        const existing = await queueCollection
          .query(
            Q.where('entity_id', entity.id),
            Q.where('entity_type', entityType),
            Q.where('operation', operation),
            Q.where('status', 'PENDING')
          )
          .fetch();

        if (existing.length === 0) {
          await queueCollection.create((queueItem) => {
            queueItem.entityType = entityType;
            queueItem.entityId = entity.id;
            queueItem.operation = operation;
            queueItem.payload = JSON.stringify(payload);
            queueItem.status = 'PENDING';
            queueItem.retryCount = 0;
            queueItem.createdAt = Date.now();
            queueItem.updatedAt = Date.now();
          });

          console.log(`OfflineManager: Added ${entityType} ${entity.id} to sync queue (${operation})`);
        } else {
          // Обновляем существующую запись
          await existing[0].update((queueItem) => {
            queueItem.payload = JSON.stringify(payload);
            queueItem.updatedAt = Date.now();
          });

          console.log(`OfflineManager: Updated sync queue item for ${entityType} ${entity.id}`);
        }
      });

      // Запускаем синхронизацию (или ставим в очередь)
      // В React Native можно использовать BackgroundTask или просто запустить синхронизацию
      this.enqueueSync();
    } catch (error) {
      console.error('OfflineManager: Failed to save change offline', error);
      throw error;
    }
  }

  /**
   * Сохранить новый контакт офлайн
   */
  async saveContactOffline(contact: CrmContact): Promise<void> {
    return this.saveChangeOffline({
      entity: contact,
      operation: 'CREATE',
      entityType: 'contact',
    });
  }

  /**
   * Обновить контакт офлайн
   */
  async updateContactOffline(contact: CrmContact): Promise<void> {
    return this.saveChangeOffline({
      entity: contact,
      operation: 'UPDATE',
      entityType: 'contact',
    });
  }

  /**
   * Удалить контакт офлайн
   */
  async deleteContactOffline(contact: CrmContact): Promise<void> {
    return this.saveChangeOffline({
      entity: contact,
      operation: 'DELETE',
      entityType: 'contact',
    });
  }

  /**
   * Сохранить новую сделку офлайн
   */
  async saveDealOffline(deal: CrmDeal): Promise<void> {
    return this.saveChangeOffline({
      entity: deal,
      operation: 'CREATE',
      entityType: 'deal',
    });
  }

  /**
   * Обновить сделку офлайн
   */
  async updateDealOffline(deal: CrmDeal): Promise<void> {
    return this.saveChangeOffline({
      entity: deal,
      operation: 'UPDATE',
      entityType: 'deal',
    });
  }

  /**
   * Удалить сделку офлайн
   */
  async deleteDealOffline(deal: CrmDeal): Promise<void> {
    return this.saveChangeOffline({
      entity: deal,
      operation: 'DELETE',
      entityType: 'deal',
    });
  }

  /**
   * Сохранить новую задачу офлайн
   */
  async saveTaskOffline(task: CrmTask): Promise<void> {
    return this.saveChangeOffline({
      entity: task,
      operation: 'CREATE',
      entityType: 'task',
    });
  }

  /**
   * Обновить задачу офлайн
   */
  async updateTaskOffline(task: CrmTask): Promise<void> {
    return this.saveChangeOffline({
      entity: task,
      operation: 'UPDATE',
      entityType: 'task',
    });
  }

  /**
   * Удалить задачу офлайн
   */
  async deleteTaskOffline(task: CrmTask): Promise<void> {
    return this.saveChangeOffline({
      entity: task,
      operation: 'DELETE',
      entityType: 'task',
    });
  }

  /**
   * Поставить задачу синхронизации в очередь
   * В React Native можно использовать BackgroundTask или просто запустить синхронизацию
   */
  private enqueueSync(): void {
    // Запускаем синхронизацию локальных изменений
    // В реальном приложении можно использовать BackgroundTask для фоновой синхронизации
    crmSyncService.processQueue().catch((error) => {
      console.error('OfflineManager: Failed to process sync queue', error);
    });
  }

  /**
   * Преобразовать сущность в payload для очереди
   */
  private entityToPayload(entity: SyncEntity, entityType: string): Record<string, any> {
    if (entity instanceof CrmContact) {
      return {
        name: entity.name,
        phone: entity.phone,
        email: entity.email,
        company: entity.company,
        position: entity.position,
        notes: entity.notes,
        status: entity.status,
        version: entity.version,
        lastModified: new Date(entity.lastModified).toISOString(),
      };
    } else if (entity instanceof CrmDeal) {
      return {
        title: entity.title,
        contactId: entity.contactId,
        amount: entity.amount,
        currency: entity.currency,
        stage: entity.stage,
        description: entity.description,
        version: entity.version,
        lastModified: new Date(entity.lastModified).toISOString(),
      };
    } else if (entity instanceof CrmTask) {
      return {
        title: entity.title,
        description: entity.description,
        status: entity.status,
        contactId: entity.contactId,
        dealId: entity.dealId,
        relatedEntityId: entity.relatedEntityId,
        relatedEntityType: entity.relatedEntityType,
        dueDate: entity.dueDate,
        assignedToUserId: entity.assignedToUserId,
        version: entity.version || 1,
        lastModified: entity.lastModified ? new Date(entity.lastModified).toISOString() : new Date().toISOString(),
      };
    }

    return {};
  }

  /**
   * Получить все несинхронизированные изменения
   */
  async getPendingChanges(): Promise<CrmSyncQueue[]> {
    if (Platform.OS === 'web' || !database) {
      return [];
    }

    const queueCollection = database.collections.get<CrmSyncQueue>('crm_sync_queue');
    return queueCollection
      .query(
        Q.where('status', 'PENDING'),
        Q.sortBy('created_at')
      )
      .fetch();
  }

  /**
   * Получить количество несинхронизированных изменений
   */
  async getPendingChangesCount(): Promise<number> {
    const pending = await this.getPendingChanges();
    return pending.length;
  }
}

export const offlineManager = new OfflineManager();

