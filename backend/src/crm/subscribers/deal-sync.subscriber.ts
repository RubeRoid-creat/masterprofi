import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from "typeorm";
import { SyncChanges, SyncOperation } from "../entities/sync-changes.entity";
import { Deal } from "../entities/deal.entity";

/**
 * Subscriber для автоматического отслеживания изменений в Deal
 */
@EventSubscriber()
export class DealSyncSubscriber implements EntitySubscriberInterface<Deal> {
  constructor(private dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Deal;
  }

  async afterInsert(event: InsertEvent<Deal>) {
    await this.createSyncChange(event.entity, SyncOperation.INSERT);
  }

  async afterUpdate(event: UpdateEvent<Deal>) {
    if (event.entity) {
      // Обновляем version и lastModified
      const entity = event.entity as Deal;
      entity.version = (entity.version || 1) + 1;
      entity.lastModified = new Date();
      await this.createSyncChange(entity, SyncOperation.UPDATE);
    } else if (event.databaseEntity) {
      await this.createSyncChange(event.databaseEntity as Deal, SyncOperation.UPDATE);
    }
  }

  async afterRemove(event: RemoveEvent<Deal>) {
    if (event.entity) {
      await this.createSyncChange(event.entity, SyncOperation.DELETE);
    }
  }

  private async createSyncChange(entity: Deal, operation: SyncOperation): Promise<void> {
    if (!entity || !entity.id) return;

    try {
      const syncChangesRepo = this.dataSource.getRepository(SyncChanges);
      await syncChangesRepo.save({
        entityType: 'deal',
        entityId: entity.id,
        operation,
        changeTimestamp: new Date(),
        processed: false,
      });
    } catch (error) {
      console.error('Failed to create sync change for Deal:', error);
    }
  }
}

