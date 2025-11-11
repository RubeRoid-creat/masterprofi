import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, In } from "typeorm";
import { CrmService } from "./crm.service";
import { RetryService } from "./services/retry.service";
import { SyncQueue, SyncQueueStatus, SyncOperation } from "./entities/sync-queue.entity";
import { SyncStatus } from "./entities/sync-status.entity";
import { SyncChanges } from "./entities/sync-changes.entity";
import { Contact } from "./entities/contact.entity";
import { Deal } from "./entities/deal.entity";
import { Task } from "./entities/task.entity";
import { Communication } from "./entities/communication.entity";
import { Product } from "./entities/product.entity";
import { UsersService } from "../users/users.service";
import { OrdersService } from "../orders/orders.service";
import { PaymentsService } from "../payments/payments.service";
import { CrmCustomersService } from "../crm-customers/crm-customers.service";
import { CrmOrdersService } from "../crm-orders/crm-orders.service";
import { ConflictResolverService } from "./services/conflict-resolver.service";

@Injectable()
export class CrmSyncService {
  constructor(
    @InjectRepository(SyncQueue)
    private syncQueueRepository: Repository<SyncQueue>,
    @InjectRepository(SyncStatus)
    private syncStatusRepository: Repository<SyncStatus>,
    @InjectRepository(SyncChanges)
    private syncChangesRepository: Repository<SyncChanges>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Communication)
    private communicationRepository: Repository<Communication>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private crmService: CrmService,
    private retryService: RetryService,
    private usersService: UsersService,
    private ordersService: OrdersService,
    private paymentsService: PaymentsService,
    private crmCustomersService: CrmCustomersService,
    private crmOrdersService: CrmOrdersService,
    private conflictResolver: ConflictResolverService
  ) {}

  /**
   * Первоначальная синхронизация - загрузка всех данных из базы
   */
  async initialSync(userId: string) {
    const syncStatus = await this.getOrCreateSyncStatus(userId);
    
    syncStatus.isSyncing = true;
    await this.syncStatusRepository.save(syncStatus);

    try {
      // Получаем данные из основных модулей
      const [customersData, ordersData] = await Promise.all([
        // Получаем клиентов через CrmCustomersService (которые используют UsersService)
        this.crmCustomersService.findAll(userId, { page: 1, pageSize: 10000 }).catch(() => ({ data: [], pagination: { total: 0 } })),
        // Получаем заказы через CrmOrdersService (которые используют OrdersService)
        this.crmOrdersService.findAll(userId, { page: 1, pageSize: 10000 }).catch(() => ({ data: [], pagination: { total: 0 } })),
      ]);

      const contacts = customersData.data || [];
      const deals = ordersData.data || [];
      const tasks: any[] = []; // Задачи можно добавить позже

      // Обновляем статус синхронизации
      syncStatus.lastFullSyncAt = new Date();
      syncStatus.lastSyncAt = new Date();
      syncStatus.isSyncing = false;
      syncStatus.totalContacts = contacts.length;
      syncStatus.totalDeals = deals.length;
      syncStatus.totalTasks = tasks.length;
      syncStatus.lastError = null;

      await this.syncStatusRepository.save(syncStatus);

      return {
        success: true,
        contacts: contacts.length,
        deals: deals.length,
        tasks: tasks.length,
        products: 0,
        syncedAt: syncStatus.lastSyncAt?.toISOString() || new Date().toISOString(),
        // Возвращаем данные для мобильного приложения в новом формате
        data: {
          contacts: contacts.map((c, index) => ({
            id: c.id,
            entity: "contact",
            data: {
              name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || '',
              phone: c.phone || '',
              email: c.email || '',
            },
            metadata: {
              version: index + 1, // Можно использовать syncVersion если есть
              last_modified: c.updatedAt ? (typeof c.updatedAt === 'string' ? c.updatedAt : c.updatedAt.toISOString()) : new Date().toISOString(),
              sync_status: c.isActive ? 'synced' : 'inactive',
            },
          })),
          deals: deals.map((o, index) => ({
            id: o.id,
            entity: "deal",
            data: {
              title: o.description || `Order #${o.id.substring(0, 8)}`,
              contactId: o.clientId || '',
              amount: parseFloat(String(o.totalAmount || 0)),
              currency: 'RUB',
              stage: o.status || 'pending',
              description: o.description || '',
            },
            metadata: {
              version: index + 1,
              last_modified: o.updatedAt ? (typeof o.updatedAt === 'string' ? o.updatedAt : o.updatedAt.toISOString()) : new Date().toISOString(),
              sync_status: 'synced',
            },
          })),
          tasks: tasks.map((t, index) => ({
            id: t.id || `task-${index}`,
            entity: "task",
            data: t,
            metadata: {
              version: index + 1,
              last_modified: new Date().toISOString(),
              sync_status: 'synced',
            },
          })),
        },
      };
    } catch (error: any) {
      console.error("Error in initialSync:", error);
      syncStatus.isSyncing = false;
      syncStatus.lastError = error.message || "Unknown error";
      await this.syncStatusRepository.save(syncStatus);
      throw new Error(`Initial sync failed: ${error.message || "Unknown error"}`);
    }
  }

  /**
   * Инкрементальная синхронизация - только изменения с указанного времени
   */
  async incrementalSync(
    userId: string,
    since?: Date,
    entityTypes?: string[]
  ) {
    const syncStatus = await this.getOrCreateSyncStatus(userId);
    const sinceDate = since || syncStatus.lastSyncAt || new Date(0);

    syncStatus.isSyncing = true;
    await this.syncStatusRepository.save(syncStatus);

    try {
      // Получаем изменения из таблицы sync_changes
      const syncChanges = await this.syncChangesRepository.find({
        where: {
          changeTimestamp: MoreThan(sinceDate),
          processed: false,
          ...(entityTypes && entityTypes.length > 0
            ? { entityType: In(entityTypes) }
            : {}),
        },
        order: {
          changeTimestamp: "ASC",
        },
      });

      const changes: any = {
        contacts: [],
        deals: [],
        tasks: [],
        communications: [],
        products: [],
      };

      // Получаем актуальные данные для каждого изменения
      for (const change of syncChanges) {
        try {
          if (change.entityType === "contact") {
            const customer = await this.crmCustomersService.findOne(change.entityId);
            if (customer) {
              changes.contacts.push({
                id: customer.id,
                name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
                email: customer.email,
                phone: customer.phone,
                status: customer.isActive ? 'active' : 'inactive',
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
              });
            }
          } else if (change.entityType === "deal") {
            const order = await this.crmOrdersService.findOne(change.entityId);
            if (order) {
              changes.deals.push({
                id: order.id,
                title: order.description || `Order #${order.id.substring(0, 8)}`,
                contactId: order.clientId,
                amount: parseFloat(String(order.totalAmount || 0)),
                currency: 'RUB',
                stage: order.status,
                description: order.description,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
              });
            }
          }
        } catch (error: any) {
          console.error(`Error fetching entity ${change.entityType}:${change.entityId}:`, error);
        }
      }

      // Помечаем изменения как обработанные
      await this.syncChangesRepository.update(
        { id: In(syncChanges.map((c) => c.id)) },
        { processed: true }
      );

      // Возвращаем количество изменений и данные
      const results = {
        contacts: changes.contacts?.length || 0,
        deals: changes.deals?.length || 0,
        tasks: changes.tasks?.length || 0,
        communications: 0,
        products: 0,
      };

      // Обновляем статус
      syncStatus.lastSyncAt = new Date();
      syncStatus.isSyncing = false;
      syncStatus.lastError = null;

      await this.syncStatusRepository.save(syncStatus);

      return {
        success: true,
        ...results,
        syncedAt: syncStatus.lastSyncAt?.toISOString() || new Date().toISOString(),
        // Возвращаем данные для мобильного приложения в новом формате
        data: {
          contacts: changes.contacts.map((c, index) => ({
            id: c.id,
            entity: "contact",
            data: {
              name: c.name || '',
              phone: c.phone || '',
              email: c.email || '',
            },
            metadata: {
              version: index + 1,
              last_modified: c.updatedAt ? (typeof c.updatedAt === 'string' ? c.updatedAt : c.updatedAt.toISOString()) : new Date().toISOString(),
              sync_status: c.status === 'active' ? 'synced' : 'inactive',
            },
          })),
          deals: changes.deals.map((d, index) => ({
            id: d.id,
            entity: "deal",
            data: {
              title: d.title || '',
              contactId: d.contactId || '',
              amount: d.amount || 0,
              currency: d.currency || 'RUB',
              stage: d.stage || 'pending',
              description: d.description || '',
            },
            metadata: {
              version: index + 1,
              last_modified: d.updatedAt ? (typeof d.updatedAt === 'string' ? d.updatedAt : d.updatedAt.toISOString()) : new Date().toISOString(),
              sync_status: 'synced',
            },
          })),
          tasks: changes.tasks.map((t, index) => ({
            id: t.id || `task-${index}`,
            entity: "task",
            data: t,
            metadata: {
              version: index + 1,
              last_modified: new Date().toISOString(),
              sync_status: 'synced',
            },
          })),
        },
      };
    } catch (error: any) {
      console.error("Error in incrementalSync:", error);
      syncStatus.isSyncing = false;
      syncStatus.lastError = error.message || "Unknown error";
      await this.syncStatusRepository.save(syncStatus);
      throw new Error(`Incremental sync failed: ${error.message || "Unknown error"}`);
    }
  }

  /**
   * Обработка исходящих изменений из приложения
   */
  async processOutgoingChanges(userId: string, changes: any[]) {
    const results = [];

    for (const change of changes) {
      try {
        // Добавляем userId в изменение для применения
        const changeWithUserId = {
          ...change,
          userId,
        };

        // Добавляем в очередь синхронизации
        const queueItem = this.syncQueueRepository.create({
          entityType: change.entityType,
          entityId: change.entityId,
          operation: change.operation,
          payload: change.payload,
          userId,
          status: SyncQueueStatus.PENDING,
        });

        await this.syncQueueRepository.save(queueItem);

        // Применяем изменения в базе данных
        try {
          await this.applyChange(changeWithUserId);

          queueItem.status = SyncQueueStatus.SENT;
          queueItem.processedAt = new Date();
        } catch (error: any) {
          // Ошибка обработки - оставляем в очереди
          queueItem.status = SyncQueueStatus.ERROR;
          queueItem.errorMessage = error.message;
          queueItem.retryCount += 1;
        }
        await this.syncQueueRepository.save(queueItem);

        results.push({ entityId: change.entityId, status: "sent" });
      } catch (error: any) {
        // Ошибка - оставляем в очереди для повторной попытки
        results.push({
          entityId: change.entityId,
          status: "error",
          error: error.message || "Unknown error",
        });
      }
    }

    // Обновляем счетчик pending changes
    const syncStatus = await this.getOrCreateSyncStatus(userId);
    syncStatus.pendingChanges = await this.syncQueueRepository.count({
      where: { userId, status: SyncQueueStatus.PENDING },
    });
    await this.syncStatusRepository.save(syncStatus);

    return { success: true, results };
  }

  /**
   * Генерация sync token для отслеживания состояния синхронизации
   */
  async generateSyncToken(userId: string): Promise<string> {
    const syncStatus = await this.getOrCreateSyncStatus(userId);
    
    // Генерируем токен на основе последней синхронизации и статуса
    const tokenData = {
      userId,
      lastSyncAt: syncStatus.lastSyncAt?.toISOString() || new Date(0).toISOString(),
      totalContacts: syncStatus.totalContacts,
      totalDeals: syncStatus.totalDeals,
      totalTasks: syncStatus.totalTasks,
      timestamp: Date.now(),
    };

    // Простой токен на основе хеша данных
    const tokenString = JSON.stringify(tokenData);
    const token = Buffer.from(tokenString).toString('base64url');
    
    // Сохраняем токен в статусе
    syncStatus.syncToken = token;
    await this.syncStatusRepository.save(syncStatus);

    return token;
  }

  /**
   * Валидация sync token
   */
  async validateSyncToken(userId: string, token: string): Promise<boolean> {
    const syncStatus = await this.getOrCreateSyncStatus(userId);
    return syncStatus.syncToken === token;
  }

  /**
   * Получить статус синхронизации
   */
  async getSyncStatus(userId: string) {
    try {
      const syncStatus = await this.getOrCreateSyncStatus(userId);
      const pendingCount = await this.syncQueueRepository.count({
        where: { userId, status: SyncQueueStatus.PENDING },
      });

      return {
        id: syncStatus.id,
        userId: syncStatus.userId,
        crmType: syncStatus.crmType,
        lastSyncAt: syncStatus.lastSyncAt,
        lastFullSyncAt: syncStatus.lastFullSyncAt,
        isSyncing: syncStatus.isSyncing,
        totalContacts: syncStatus.totalContacts,
        totalDeals: syncStatus.totalDeals,
        totalTasks: syncStatus.totalTasks,
        pendingChanges: pendingCount,
        lastError: syncStatus.lastError,
        createdAt: syncStatus.createdAt,
        updatedAt: syncStatus.updatedAt,
      };
    } catch (error: any) {
      console.error("Error in getSyncStatus:", error);
      throw new Error(`Failed to get sync status: ${error.message}`);
    }
  }

  // Приватные методы

  private async getOrCreateSyncStatus(userId: string): Promise<SyncStatus> {
    let syncStatus = await this.syncStatusRepository.findOne({
      where: { userId },
    });

    if (!syncStatus) {
      syncStatus = this.syncStatusRepository.create({
        userId,
      });
      await this.syncStatusRepository.save(syncStatus);
    }

    return syncStatus;
  }

  private async saveContacts(contacts: any[]): Promise<Contact[]> {
    const saved: Contact[] = [];
    for (const contactData of contacts) {
      let contact: Contact | null = await this.contactRepository.findOne({
        where: { id: contactData.id },
      });

      if (contact) {
        Object.assign(contact, {
          ...contactData,
          lastSyncedAt: new Date(),
          syncVersion: contact.syncVersion + 1,
        });
      } else {
        contact = this.contactRepository.create({
          ...contactData,
          lastSyncedAt: new Date(),
        }) as unknown as Contact;
      }

      saved.push(await this.contactRepository.save(contact));
    }
    return saved;
  }

  private async saveDeals(deals: any[]): Promise<Deal[]> {
    const saved: Deal[] = [];
    for (const dealData of deals) {
      let deal: Deal | null = await this.dealRepository.findOne({
        where: { id: dealData.id },
      });

      if (deal) {
        Object.assign(deal, {
          ...dealData,
          lastSyncedAt: new Date(),
          syncVersion: deal.syncVersion + 1,
        });
      } else {
        deal = this.dealRepository.create({
          ...dealData,
          lastSyncedAt: new Date(),
        }) as unknown as Deal;
      }

      saved.push(await this.dealRepository.save(deal));
    }
    return saved;
  }

  private async saveTasks(tasks: any[]): Promise<Task[]> {
    const saved: Task[] = [];
    for (const taskData of tasks) {
      let task: Task | null = await this.taskRepository.findOne({
        where: { id: taskData.id },
      });

      if (task) {
        Object.assign(task, {
          ...taskData,
          lastSyncedAt: new Date(),
          syncVersion: task.syncVersion + 1,
        });
      } else {
        task = this.taskRepository.create({
          ...taskData,
          lastSyncedAt: new Date(),
        }) as unknown as Task;
      }

      saved.push(await this.taskRepository.save(task));
    }
    return saved;
  }

  private async applyChange(change: any): Promise<void> {
    // Применяем изменение в базе данных через основные сервисы
    if (change.entityType === "contact" || change.entityType === "customer") {
      if (change.operation === "CREATE") {
        // Создаем клиента через CrmCustomersService
        await this.crmCustomersService.create(change.payload, change.userId);
      } else if (change.operation === "UPDATE") {
        if (change.entityId) {
          await this.crmCustomersService.update(change.entityId, change.payload);
        }
      } else if (change.operation === "DELETE") {
        if (change.entityId) {
          await this.crmCustomersService.remove(change.entityId);
        }
      }
    } else if (change.entityType === "deal" || change.entityType === "order") {
      if (change.operation === "CREATE") {
        // Создаем заказ через CrmOrdersService
        await this.crmOrdersService.create(change.payload, change.userId);
      } else if (change.operation === "UPDATE") {
        if (change.entityId) {
          // Обновляем заказ через OrdersService
          await this.ordersService.update(change.entityId, change.payload, change.userId);
        }
      } else if (change.operation === "DELETE") {
        if (change.entityId) {
          await this.ordersService.remove(change.entityId);
        }
      }
    } else if (change.entityType === "task") {
      if (change.operation === "CREATE") {
        await this.crmService.createTask(change.payload);
      } else if (change.operation === "UPDATE") {
        if (change.entityId) {
          await this.crmService.updateTask(change.entityId, change.payload);
        }
      }
    }
  }

  /**
   * Получить изменения (алиас для incrementalSync)
   * Возвращает полные данные сущностей для синхронизации
   */
  async getChanges(userId: string, since?: Date, entityTypes?: string[]) {
    return this.incrementalSync(userId, since, entityTypes);
  }

  /**
   * Получить только изменения из таблицы sync_changes
   * Возвращает список изменений без полных данных сущностей
   * Аналог Flask endpoint: /api/sync/changes
   */
  async getChangesList(userId: string, since?: Date, entityTypes?: string[]) {
    const syncStatus = await this.getOrCreateSyncStatus(userId);
    const sinceDate = since || syncStatus.lastSyncAt || new Date(0);

    // Получаем изменения из таблицы sync_changes
    const whereCondition: any = {
      changeTimestamp: MoreThan(sinceDate),
    };

    if (entityTypes && entityTypes.length > 0) {
      whereCondition.entityType = In(entityTypes);
    }

    const syncChanges = await this.syncChangesRepository.find({
      where: whereCondition,
      order: {
        changeTimestamp: "ASC",
      },
    });

    // Преобразуем в простой формат
    return syncChanges.map((change) => ({
      id: change.id,
      entityType: change.entityType,
      entityId: change.entityId,
      operation: change.operation,
      changeTimestamp: change.changeTimestamp,
      processed: change.processed,
      createdAt: change.createdAt,
    }));
  }

  /**
   * Отправить изменения (алиас для processOutgoingChanges)
   */
  async pushChanges(userId: string, changes: any[]) {
    return this.processOutgoingChanges(userId, changes);
  }

  /**
   * Отправить изменения батчем (пачками по 50 записей)
   */
  async pushBatch(userId: string, batch: { changes: any[]; batchId: string; lastBatch?: boolean }) {
    const { changes, batchId, lastBatch = false } = batch;

    // Проверяем размер батча
    if (changes.length > 50) {
      throw new Error(`Batch size exceeds maximum of 50 changes. Received: ${changes.length}`);
    }

    console.log(`Processing batch ${batchId} with ${changes.length} changes (lastBatch: ${lastBatch})`);

    // Обрабатываем изменения
    const result = await this.processOutgoingChanges(userId, changes);

    return {
      success: true,
      batchId,
      lastBatch,
      processed: changes.length,
      results: result.results,
      message: lastBatch ? "All batches processed" : "Batch processed, more batches expected",
    };
  }

  /**
   * Разбить изменения на батчи по 50 записей
   */
  splitIntoBatches(changes: any[], batchSize: number = 50): any[][] {
    const batches: any[][] = [];
    for (let i = 0; i < changes.length; i += batchSize) {
      batches.push(changes.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Разрешить конфликт синхронизации
   * Использует автоматическое разрешение на основе версий и времени последнего изменения
   */
  async resolveConflict(
    userId: string,
    entityId: string,
    entityType: string,
    strategy: 'server_wins' | 'client_wins' | 'merge' | 'auto',
    clientData?: Record<string, any>,
    clientVersion?: number,
    clientLastModified?: string
  ) {
    try {
      // Получаем текущую версию на сервере
      let serverEntity: any = null;

      if (entityType === 'contact') {
        serverEntity = await this.crmCustomersService.findOne(entityId);
      } else if (entityType === 'deal') {
        serverEntity = await this.crmOrdersService.findOne(entityId);
      }

      if (!serverEntity) {
        throw new NotFoundException(`Entity ${entityType}:${entityId} not found`);
      }

      // Нормализуем данные сервера
      const serverData = {
        ...serverEntity,
        version: serverEntity.version || serverEntity.syncVersion || 1,
        lastModified: serverEntity.lastModified || serverEntity.updatedAt || serverEntity.createdAt,
      };

      let resolvedData: any;

      // Если стратегия 'auto' - используем автоматическое разрешение
      if (strategy === 'auto' || !strategy) {
        if (!clientData || clientVersion === undefined || !clientLastModified) {
          throw new Error('Client data, version, and lastModified are required for auto resolution');
        }

        // Нормализуем данные клиента
        const localData = {
          ...clientData,
          version: clientVersion,
          lastModified: new Date(clientLastModified),
        };

        // Используем ConflictResolver для автоматического разрешения
        resolvedData = this.conflictResolver.resolveConflict(serverData, localData);

        // Применяем разрешенные данные
        if (entityType === 'contact') {
          await this.crmCustomersService.update(entityId, resolvedData);
        } else if (entityType === 'deal') {
          await this.ordersService.update(entityId, resolvedData, userId);
        }
      } else {
        // Используем ручные стратегии (для обратной совместимости)
        switch (strategy) {
          case 'server_wins':
            resolvedData = serverData;
            break;

          case 'client_wins':
            if (!clientData) {
              throw new Error('Client data is required for client_wins strategy');
            }
            resolvedData = {
              ...clientData,
              version: clientVersion || 1,
              lastModified: clientLastModified ? new Date(clientLastModified) : new Date(),
            };
            
            // Применяем изменения клиента
            if (entityType === 'contact') {
              await this.crmCustomersService.update(entityId, resolvedData);
            } else if (entityType === 'deal') {
              await this.ordersService.update(entityId, resolvedData, userId);
            }
            break;

          case 'merge':
            if (!clientData) {
              throw new Error('Client data is required for merge strategy');
            }
            
            // Используем merge из ConflictResolver
            const localData = {
              ...clientData,
              version: clientVersion || 1,
              lastModified: clientLastModified ? new Date(clientLastModified) : new Date(),
            };
            resolvedData = this.conflictResolver.mergeData(serverData, localData);

            if (entityType === 'contact') {
              await this.crmCustomersService.update(entityId, resolvedData);
            } else if (entityType === 'deal') {
              await this.ordersService.update(entityId, resolvedData, userId);
            }
            break;

          default:
            throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
        }
      }

      // Помечаем изменения как обработанные
      await this.syncChangesRepository.update(
        {
          entityId,
          entityType,
          processed: false,
        },
        {
          processed: true,
        }
      );

      return {
        success: true,
        entityId,
        entityType,
        strategy: strategy || 'auto',
        resolvedData,
        serverVersion: serverData.version,
        clientVersion: clientVersion || 0,
        serverLastModified: serverData.lastModified instanceof Date 
          ? serverData.lastModified.toISOString() 
          : serverData.lastModified,
        clientLastModified: clientLastModified || null,
      };
    } catch (error: any) {
      console.error('Error resolving conflict:', error);
      throw new Error(`Failed to resolve conflict: ${error.message}`);
    }
  }
}

