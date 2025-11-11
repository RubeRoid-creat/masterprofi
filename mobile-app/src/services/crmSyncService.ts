/**
 * CRM Sync Service
 * Handles synchronization between local WatermelonDB and remote CRM server
 */

import { Platform } from 'react-native';
import { database } from '../database/database';
import { Q } from '@nozbe/watermelondb';
import { crmApi } from '../store/api/crmApi';
import { store } from '../store/store';
import CrmContact from '../database/models/CrmContact';
import CrmDeal from '../database/models/CrmDeal';
import CrmTask from '../database/models/CrmTask';
import CrmSyncQueue, { SyncOperation } from '../database/models/CrmSyncQueue';
import * as NetInfo from '@react-native-community/netinfo';
import { retryPolicy } from './retryPolicy';

class CrmSyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly syncIntervalMs = 15 * 60 * 1000; // 15 минут

  /**
   * Первоначальная синхронизация - загрузка всех данных
   */
  async initialSync(): Promise<void> {
    if (Platform.OS === 'web' || !database) {
      console.warn('CrmSyncService: Database is not available on web platform.');
      return;
    }

    if (this.isSyncing) {
      console.warn('CrmSyncService: Sync already in progress');
      return;
    }

    this.isSyncing = true;

    try {
      const result = await store.dispatch(
        crmApi.endpoints.initialSync.initiate()
      ).unwrap();

      // Получаем данные из ответа
      const data = (result as any).data || {};
      const contacts = data.contacts || [];
      const deals = data.deals || [];
      const tasks = data.tasks || [];

      console.log('CrmSyncService: Initial sync data received', {
        contactsCount: contacts.length,
        dealsCount: deals.length,
        tasksCount: tasks.length,
        result: result,
      });

      await database.write(async () => {
        // Сохраняем контакты (новый формат с entity и data)
        if (contacts.length > 0) {
          const contactsCollection = database.collections.get<CrmContact>('crm_contacts');
          for (const contactItem of contacts) {
            // Поддерживаем оба формата (старый и новый)
            const contactData = contactItem.entity === 'contact' && contactItem.data 
              ? { ...contactItem.data, id: contactItem.id, metadata: contactItem.metadata }
              : contactItem;
            
            const crmId = contactData.id || contactData.crmId;
            if (!crmId) {
              console.warn('CrmSyncService: Contact data missing id', contactData);
              continue;
            }

            const existing = await contactsCollection
              .query(Q.where('crm_id', crmId))
              .fetch();

            const name = contactData.name || contactData.data?.name || '';
            const email = contactData.email || contactData.data?.email || '';
            const phone = contactData.phone || contactData.data?.phone || '';
            const status = contactData.status || contactData.metadata?.sync_status === 'synced' ? 'active' : 'inactive';
            const lastModified = contactData.metadata?.last_modified || contactData.updatedAt || contactData.createdAt;
            const version = contactData.metadata?.version || 1;

            if (existing.length > 0) {
              await existing[0].update((contact) => {
                contact.crmId = crmId;
                contact.name = name;
                contact.email = email;
                contact.phone = phone;
                contact.status = status;
                contact.isSynced = true;
                contact.syncStatus = 'synced';
                contact.syncVersion = version;
                contact.lastSyncedAt = Date.now();
                contact.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
              });
            } else {
              await contactsCollection.create((contact) => {
                contact.crmId = crmId;
                contact.name = name;
                contact.email = email;
                contact.phone = phone;
                contact.status = status;
                contact.isSynced = true;
                contact.syncStatus = 'synced';
                contact.syncVersion = version;
                contact.lastSyncedAt = Date.now();
                contact.createdAt = lastModified ? new Date(lastModified).getTime() : Date.now();
                contact.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
              });
              console.log(`CrmSyncService: Created contact ${crmId}: ${name || email}`);
            }
          }
        }

        // Сохраняем сделки (новый формат с entity и data)
        if (deals.length > 0) {
          const dealsCollection = database.collections.get<CrmDeal>('crm_deals');
          for (const dealItem of deals) {
            // Поддерживаем оба формата (старый и новый)
            const dealData = dealItem.entity === 'deal' && dealItem.data
              ? { ...dealItem.data, id: dealItem.id, metadata: dealItem.metadata }
              : dealItem;
            
            const crmId = dealData.id || dealData.crmId;
            if (!crmId) {
              console.warn('CrmSyncService: Deal data missing id', dealData);
              continue;
            }

            const existing = await dealsCollection
              .query(Q.where('crm_id', crmId))
              .fetch();

            const title = dealData.title || dealData.data?.title || '';
            const contactId = dealData.contactId || dealData.data?.contactId || '';
            const amount = dealData.amount || dealData.data?.amount || 0;
            const currency = dealData.currency || dealData.data?.currency || 'RUB';
            const stage = dealData.stage || dealData.data?.stage || '';
            const description = dealData.description || dealData.data?.description || '';
            const lastModified = dealData.metadata?.last_modified || dealData.updatedAt || dealData.createdAt;
            const version = dealData.metadata?.version || 1;

            if (existing.length > 0) {
              await existing[0].update((deal) => {
                deal.crmId = crmId;
                deal.title = title;
                deal.contactId = contactId;
                deal.amount = amount;
                deal.currency = currency;
                deal.stage = stage;
                deal.description = description;
                deal.isSynced = true;
                deal.syncStatus = 'synced';
                deal.syncVersion = version;
                deal.lastSyncedAt = Date.now();
                deal.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
              });
            } else {
              await dealsCollection.create((deal) => {
                deal.crmId = crmId;
                deal.title = title;
                deal.contactId = contactId;
                deal.amount = amount;
                deal.currency = currency;
                deal.stage = stage;
                deal.description = description;
                deal.isSynced = true;
                deal.syncStatus = 'synced';
                deal.syncVersion = version;
                deal.lastSyncedAt = Date.now();
                deal.createdAt = lastModified ? new Date(lastModified).getTime() : Date.now();
                deal.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
              });
              console.log(`CrmSyncService: Created deal ${crmId}: ${title}`);
            }
          }
        }

        // Сохраняем задачи (новый формат с entity и data)
        if (tasks.length > 0) {
          const tasksCollection = database.collections.get<CrmTask>('crm_tasks');
          for (const taskItem of tasks) {
            // Поддерживаем оба формата (старый и новый)
            const taskData = taskItem.entity === 'task' && taskItem.data
              ? { ...taskItem.data, id: taskItem.id, metadata: taskItem.metadata }
              : taskItem;
            
            const crmId = taskData.id || taskData.crmId;
            if (!crmId) {
              console.warn('CrmSyncService: Task data missing id', taskData);
              continue;
            }

            const existing = await tasksCollection
              .query(Q.where('crm_id', crmId))
              .fetch();

            const title = taskData.title || taskData.data?.title || '';
            const description = taskData.description || taskData.data?.description || '';
            const status = taskData.status || taskData.data?.status || 'pending';
            const lastModified = taskData.metadata?.last_modified || taskData.updatedAt || taskData.createdAt;
            const version = taskData.metadata?.version || 1;

            if (existing.length > 0) {
              await existing[0].update((task) => {
                task.crmId = crmId;
                task.title = title;
                task.description = description;
                task.status = status;
                task.isSynced = true;
                task.syncStatus = 'synced';
                task.syncVersion = version;
                task.lastSyncedAt = Date.now();
                task.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
              });
            } else {
              await tasksCollection.create((task) => {
                task.crmId = crmId;
                task.title = title;
                task.description = description;
                task.status = status;
                task.isSynced = true;
                task.syncStatus = 'synced';
                task.syncVersion = version;
                task.lastSyncedAt = Date.now();
                task.createdAt = lastModified ? new Date(lastModified).getTime() : Date.now();
                task.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
              });
              console.log(`CrmSyncService: Created task ${crmId}: ${title}`);
            }
          }
        }
      });

      console.log('CrmSyncService: Initial sync completed', result);
    } catch (error) {
      console.error('CrmSyncService: Initial sync failed', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Инкрементальная синхронизация - только изменения
   */
  async incrementalSync(
    since?: Date,
    entityTypes?: string[]
  ): Promise<void> {
    if (Platform.OS === 'web' || !database) {
      console.warn('CrmSyncService: Database is not available on web platform.');
      return;
    }

    if (this.isSyncing) {
      console.warn('CrmSyncService: Sync already in progress');
      return;
    }

    this.isSyncing = true;

    try {
      const sinceDate = since || await this.getLastSyncDate();
      const result = await store.dispatch(
        crmApi.endpoints.incrementalSync.initiate({
          since: sinceDate?.toISOString(),
          entityTypes,
        })
      ).unwrap();

      // Применяем изменения из ответа
      const data = (result as any).data || {};
      
      console.log('CrmSyncService: Incremental sync data received', {
        contactsCount: data.contacts?.length || 0,
        dealsCount: data.deals?.length || 0,
        tasksCount: data.tasks?.length || 0,
        result: result,
      });

      await this.applyChanges(data);

      // Обновляем дату последней синхронизации
      await this.updateLastSyncDate(new Date());

      console.log('CrmSyncService: Incremental sync completed', result);
    } catch (error) {
      console.error('CrmSyncService: Incremental sync failed', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Применить изменения из сервера
   */
  private async applyChanges(result: {
    contacts?: any[];
    deals?: any[];
    tasks?: any[];
  }): Promise<void> {
    if (!database) return;

    await database.write(async () => {
      // Применяем изменения контактов (новый формат с entity и data)
      if (result.contacts && result.contacts.length > 0) {
        console.log(`CrmSyncService: Processing ${result.contacts.length} contacts`);
        const contactsCollection = database.collections.get<CrmContact>('crm_contacts');
        for (const contactItem of result.contacts) {
          // Поддерживаем оба формата (старый и новый)
          const contactData = contactItem.entity === 'contact' && contactItem.data 
            ? { ...contactItem.data, id: contactItem.id, metadata: contactItem.metadata }
            : contactItem;
          
          const crmId = contactData.id || contactData.crmId;
          if (!crmId) {
            console.warn('CrmSyncService: Contact data missing id', contactData);
            continue;
          }

          const existing = await contactsCollection
            .query(Q.where('crm_id', crmId))
            .fetch();

          const name = contactData.name || contactData.data?.name || '';
          const email = contactData.email || contactData.data?.email || '';
          const phone = contactData.phone || contactData.data?.phone || '';
          const status = contactData.status || (contactData.metadata?.sync_status === 'synced' ? 'active' : 'inactive');
          const lastModified = contactData.metadata?.last_modified || contactData.updatedAt || contactData.createdAt;
          const version = contactData.metadata?.version || 1;

          if (existing.length > 0) {
            // Обновляем существующий контакт
            await existing[0].update((contact) => {
              contact.crmId = crmId;
              contact.name = name;
              contact.email = email;
              contact.phone = phone;
              contact.status = status;
              contact.isSynced = true;
              contact.syncStatus = 'synced';
              contact.syncVersion = version;
              contact.lastSyncedAt = Date.now();
              contact.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
            });
          } else {
            // Создаем новый контакт
            const newContact = await contactsCollection.create((contact) => {
              contact.crmId = crmId;
              contact.name = name;
              contact.email = email;
              contact.phone = phone;
              contact.status = status;
              contact.isSynced = true;
              contact.syncStatus = 'synced';
              contact.syncVersion = version;
              contact.lastSyncedAt = Date.now();
              contact.createdAt = lastModified ? new Date(lastModified).getTime() : Date.now();
              contact.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
            });
            console.log(`CrmSyncService: Created contact ${crmId}: ${name || email}`, {
              id: newContact.id,
              crmId: newContact.crmId,
              name: newContact.name,
            });
          }
        }
        console.log(`CrmSyncService: Contacts processing completed`);
      } else {
        console.log('CrmSyncService: No contacts to process');
      }

      // Применяем изменения сделок (новый формат с entity и data)
      if (result.deals && result.deals.length > 0) {
        const dealsCollection = database.collections.get<CrmDeal>('crm_deals');
        for (const dealItem of result.deals) {
          // Поддерживаем оба формата (старый и новый)
          const dealData = dealItem.entity === 'deal' && dealItem.data
            ? { ...dealItem.data, id: dealItem.id, metadata: dealItem.metadata }
            : dealItem;
          
          const crmId = dealData.id || dealData.crmId;
          if (!crmId) {
            console.warn('CrmSyncService: Deal data missing id', dealData);
            continue;
          }

          const existing = await dealsCollection
            .query(Q.where('crm_id', crmId))
            .fetch();

          const title = dealData.title || dealData.data?.title || '';
          const contactId = dealData.contactId || dealData.data?.contactId || '';
          const amount = dealData.amount || dealData.data?.amount || 0;
          const currency = dealData.currency || dealData.data?.currency || 'RUB';
          const stage = dealData.stage || dealData.data?.stage || '';
          const description = dealData.description || dealData.data?.description || '';
          const lastModified = dealData.metadata?.last_modified || dealData.updatedAt || dealData.createdAt;
          const version = dealData.metadata?.version || 1;

          if (existing.length > 0) {
            await existing[0].update((deal) => {
              deal.crmId = crmId;
              deal.title = title;
              deal.contactId = contactId;
              deal.amount = amount;
              deal.currency = currency;
              deal.stage = stage;
              deal.description = description;
              deal.isSynced = true;
              deal.syncStatus = 'synced';
              deal.syncVersion = version;
              deal.lastSyncedAt = Date.now();
              deal.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
            });
          } else {
            await dealsCollection.create((deal) => {
              deal.crmId = crmId;
              deal.title = title;
              deal.contactId = contactId;
              deal.amount = amount;
              deal.currency = currency;
              deal.stage = stage;
              deal.description = description;
              deal.isSynced = true;
              deal.syncStatus = 'synced';
              deal.syncVersion = version;
              deal.lastSyncedAt = Date.now();
              deal.createdAt = lastModified ? new Date(lastModified).getTime() : Date.now();
              deal.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
            });
            console.log(`CrmSyncService: Created deal ${crmId}: ${title}`);
          }
        }
      }

      // Применяем изменения задач (новый формат с entity и data)
      if (result.tasks && result.tasks.length > 0) {
        const tasksCollection = database.collections.get<CrmTask>('crm_tasks');
        for (const taskItem of result.tasks) {
          // Поддерживаем оба формата (старый и новый)
          const taskData = taskItem.entity === 'task' && taskItem.data
            ? { ...taskItem.data, id: taskItem.id, metadata: taskItem.metadata }
            : taskItem;
          
          const crmId = taskData.id || taskData.crmId;
          if (!crmId) {
            console.warn('CrmSyncService: Task data missing id', taskData);
            continue;
          }

          const existing = await tasksCollection
            .query(Q.where('crm_id', crmId))
            .fetch();

          const title = taskData.title || taskData.data?.title || '';
          const description = taskData.description || taskData.data?.description || '';
          const status = taskData.status || taskData.data?.status || 'pending';
          const lastModified = taskData.metadata?.last_modified || taskData.updatedAt || taskData.createdAt;
          const version = taskData.metadata?.version || 1;

          if (existing.length > 0) {
            await existing[0].update((task) => {
              task.crmId = crmId;
              task.title = title;
              task.description = description;
              task.status = status;
              task.isSynced = true;
              task.syncStatus = 'synced';
              task.syncVersion = version;
              task.lastSyncedAt = Date.now();
              task.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
            });
          } else {
            await tasksCollection.create((task) => {
              task.crmId = crmId;
              task.title = title;
              task.description = description;
              task.status = status;
              task.isSynced = true;
              task.syncStatus = 'synced';
              task.syncVersion = version;
              task.lastSyncedAt = Date.now();
              task.createdAt = lastModified ? new Date(lastModified).getTime() : Date.now();
              task.updatedAt = lastModified ? new Date(lastModified).getTime() : Date.now();
            });
            console.log(`CrmSyncService: Created task ${crmId}: ${title}`);
          }
        }
      }
    });
  }

  /**
   * Добавить изменение в очередь для отправки
   */
  async queueChange(
    entityType: string,
    entityId: string,
    operation: SyncOperation,
    payload: Record<string, any>
  ): Promise<void> {
    if (Platform.OS === 'web' || !database) {
      console.warn('CrmSyncService: Database is not available on web platform.');
      return;
    }

    await database.write(async () => {
      const queueCollection = database.collections.get<CrmSyncQueue>('crm_sync_queue');
      await queueCollection.create((item) => {
        item.entityType = entityType;
        item.entityId = entityId;
        item.operation = operation;
        item.payload = JSON.stringify(payload);
        item.status = 'PENDING';
        item.retryCount = 0;
        item.createdAt = Date.now();
        item.updatedAt = Date.now();
      });
    });

    // Попытаемся сразу отправить, если есть интернет
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await this.processQueue();
    }
  }

  /**
   * Главный метод синхронизации (как в Kotlin примере)
   * Запускает полный цикл синхронизации
   */
  async startSync(): Promise<void> {
    if (Platform.OS === 'web' || !database) {
      console.warn('CrmSyncService: Database is not available on web platform.');
      return;
    }

    if (this.isSyncing) {
      console.warn('CrmSyncService: Sync already in progress');
      return;
    }

    this.isSyncing = true;

    try {
      console.log('CrmSyncService: Starting sync cycle...');

      // 1. Отправляем локальные изменения
      await this.syncLocalChanges();

      // 2. Запрашиваем изменения с сервера
      await this.syncServerChanges();

      // 3. Разрешаем конфликты
      await this.resolveConflicts();

      console.log('CrmSyncService: Sync cycle completed');
    } catch (error) {
      console.error('CrmSyncService: Sync cycle failed', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Отправка локальных изменений на сервер батчами (syncLocalChanges)
   * Отправляет изменения пачками по 50 записей
   */
  private async syncLocalChanges(): Promise<void> {
    if (!database) return;

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('CrmSyncService: No internet connection, skipping local changes sync');
      return;
    }

    const queueCollection = database.collections.get<CrmSyncQueue>('crm_sync_queue');
    const allPendingChanges = await queueCollection
      .query(
        Q.where('status', 'PENDING'),
        Q.sortBy('created_at')
      )
      .fetch();

    // Фильтруем изменения, для которых прошла задержка перед повторной попыткой
    const now = Date.now();
    const unsyncedChanges = allPendingChanges.filter((change) => {
      const retryCount = change.retryCount || 0;
      const maxRetries = 10;

      // Проверяем, не превышен ли лимит попыток
      if (!retryPolicy.shouldRetry(retryCount, maxRetries)) {
        return false; // Пропускаем элементы с превышенным лимитом
      }

      // Если это первая попытка (retryCount = 0), обрабатываем сразу
      if (retryCount === 0) {
        return true;
      }

      // Вычисляем задержку для текущего retryCount
      // retryCount указывает на количество уже выполненных попыток
      // delay для следующей попытки рассчитывается на основе текущего retryCount
      const delay = retryPolicy.getNextRetryDelay(retryCount);
      
      // Проверяем, прошло ли достаточно времени с момента последнего обновления
      const timeSinceUpdate = now - change.updatedAt;
      return timeSinceUpdate >= delay;
    });

    if (unsyncedChanges.length === 0) {
      console.log('CrmSyncService: No local changes ready to sync');
      return;
    }

    console.log(`CrmSyncService: Syncing ${unsyncedChanges.length} local changes in batches...`);

    // Разбиваем на батчи по 50 записей
    const batchSize = 50;
    const batches: CrmSyncQueue[][] = [];
    for (let i = 0; i < unsyncedChanges.length; i += batchSize) {
      batches.push(unsyncedChanges.slice(i, i + batchSize));
    }

    // Генерируем уникальный ID для всех батчей этой сессии
    const sessionBatchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Отправляем каждый батч
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const isLastBatch = i === batches.length - 1;
      const batchId = `${sessionBatchId}-${i + 1}`;

      try {
        const changes = batch.map((change) => ({
          entityId: change.entityId || '',
          entityType: change.entityType,
          operation: change.operation,
          payload: change.getPayload(),
        }));

        const result = await store.dispatch(
          crmApi.endpoints.outgoingSync.initiate({
            changes,
            batchId,
            lastBatch: isLastBatch,
          } as any)
        ).unwrap();

        // Помечаем изменения как синхронизированные
        await database.write(async () => {
          for (let j = 0; j < batch.length; j++) {
            const change = batch[j];
            const changeResult = result.results?.[j];
            
            if (changeResult?.status === 'sent' || result.processed) {
              await change.markAsSent();
            } else {
              await change.markAsError(changeResult?.error || 'Unknown error');
            }
          }
        });

        console.log(`CrmSyncService: Successfully synced batch ${batchId} (${batch.length} changes)`);
      } catch (error: any) {
        console.error(`CrmSyncService: Failed to sync batch ${batchId}`, error);

        // Обновляем retryCount для каждого изменения и применяем retry policy
        await database.write(async () => {
          for (const change of batch) {
            const currentRetryCount = change.retryCount || 0;
            const newRetryCount = currentRetryCount + 1;
            const maxRetries = 10;

            // Проверяем, нужно ли делать повторную попытку (проверяем ПОСЛЕ увеличения счетчика)
            if (retryPolicy.shouldRetry(newRetryCount, maxRetries)) {
              // Задержка для следующей попытки рассчитывается на основе нового retryCount
              const delay = retryPolicy.getNextRetryDelay(newRetryCount);
              const retryInfo = retryPolicy.getRetryInfo(newRetryCount, maxRetries);

              console.log(
                `CrmSyncService: Change ${change.id} will retry after ${delay}ms (${retryInfo.delaySeconds}s). Attempt ${newRetryCount}/${maxRetries}`
              );

              // Оставляем в статусе PENDING для повторной попытки
              await change.update((item) => {
                item.retryCount = newRetryCount;
                item.status = 'PENDING';
                item.errorMessage = `Retry ${newRetryCount}/${maxRetries}: ${error.message || 'Unknown error'}`;
                item.updatedAt = Date.now();
              });
            } else {
              // Превышен лимит попыток - помечаем как ошибку
              await change.update((item) => {
                item.status = 'ERROR';
                item.errorMessage = error.message || 'Unknown error';
                item.retryCount = newRetryCount;
                item.updatedAt = Date.now();
              });
              console.error(`CrmSyncService: Change ${change.id} exceeded max retries (${maxRetries})`);
            }
          }
        });
      }
    }
  }

  /**
   * Запрос изменений с сервера (syncServerChanges)
   */
  private async syncServerChanges(): Promise<void> {
    if (!database) return;

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('CrmSyncService: No internet connection, skipping server changes sync');
      return;
    }

    try {
      // Получаем дату последней синхронизации
      const lastSyncDate = await this.getLastSyncDate();

      // Запрашиваем инкрементальные изменения
      await this.incrementalSync(lastSyncDate);

      console.log('CrmSyncService: Server changes synced');
    } catch (error) {
      console.error('CrmSyncService: Failed to sync server changes', error);
      throw error;
    }
  }

  /**
   * Разрешение конфликтов (resolveConflicts)
   */
  private async resolveConflicts(): Promise<void> {
    if (!database) return;

    // Здесь можно реализовать логику разрешения конфликтов
    // Например, если локальная версия новее серверной, используем локальную
    // Или если серверная версия новее, используем серверную

    console.log('CrmSyncService: Conflict resolution completed');
  }

  /**
   * Обработать очередь исходящих изменений (использует syncLocalChanges)
   */
  async processQueue(): Promise<void> {
    await this.syncLocalChanges();
  }

  /**
   * Получить дату последней синхронизации
   */
  private async getLastSyncDate(): Promise<Date | undefined> {
    if (!database) return undefined;

    const syncStatusCollection = database.collections.get('sync_status');
    const status = await syncStatusCollection
      .query(Q.where('table_name', 'crm'))
      .fetch();

    if (status.length > 0 && status[0].last_synced_at) {
      return new Date(status[0].last_synced_at);
    }

    return undefined;
  }

  /**
   * Обновить дату последней синхронизации
   */
  private async updateLastSyncDate(date: Date): Promise<void> {
    if (!database) return;

    await database.write(async () => {
      const syncStatusCollection = database.collections.get('sync_status');
      const status = await syncStatusCollection
        .query(Q.where('table_name', 'crm'))
        .fetch();

      if (status.length > 0) {
        await status[0].update((record) => {
          record.last_synced_at = date.getTime();
        });
      } else {
        await syncStatusCollection.create((record) => {
          record.table_name = 'crm';
          record.last_synced_at = date.getTime();
          record.created_at = Date.now();
          record.updated_at = Date.now();
        });
      }
    });
  }

  /**
   * Запустить автоматическую синхронизацию (каждые 15 минут)
   */
  startAutoSync(intervalMs: number = this.syncIntervalMs): void {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    console.log(`CrmSyncService: Starting auto sync with interval ${intervalMs / 1000 / 60} minutes`);

    // Запускаем первую синхронизацию сразу
    this.startSync().catch((error) => {
      console.error('CrmSyncService: Initial auto sync failed:', error);
    });

    // Затем по расписанию
    this.syncInterval = setInterval(() => {
      this.startSync().catch((error) => {
        console.error('CrmSyncService: Auto sync failed:', error);
      });
    }, intervalMs);
  }

  /**
   * Остановить автоматическую синхронизацию
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('CrmSyncService: Auto sync stopped');
    }
  }
}

export const crmSyncService = new CrmSyncService();

