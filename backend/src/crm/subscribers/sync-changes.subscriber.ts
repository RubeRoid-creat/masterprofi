import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from "typeorm";
import { SyncChanges, SyncOperation } from "../entities/sync-changes.entity";
import { Contact } from "../entities/contact.entity";

/**
 * Subscriber для автоматического отслеживания изменений в Contact
 */
@EventSubscriber()
export class ContactSyncSubscriber implements EntitySubscriberInterface<Contact> {
  constructor(private dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Contact;
  }

  async afterInsert(event: InsertEvent<Contact>) {
    await this.createSyncChange(event.entity, SyncOperation.INSERT);
  }

  async afterUpdate(event: UpdateEvent<Contact>) {
    if (event.entity) {
      // Обновляем version и lastModified
      const entity = event.entity as Contact;
      entity.version = (entity.version || 1) + 1;
      entity.lastModified = new Date();
      await this.createSyncChange(entity, SyncOperation.UPDATE);
    } else if (event.databaseEntity) {
      await this.createSyncChange(event.databaseEntity as Contact, SyncOperation.UPDATE);
    }
  }

  async afterRemove(event: RemoveEvent<Contact>) {
    if (event.entity) {
      await this.createSyncChange(event.entity, SyncOperation.DELETE);
    }
  }

  private async createSyncChange(entity: Contact, operation: SyncOperation): Promise<void> {
    if (!entity || !entity.id) return;

    try {
      const syncChangesRepo = this.dataSource.getRepository(SyncChanges);
      await syncChangesRepo.save({
        entityType: 'contact',
        entityId: entity.id,
        operation,
        changeTimestamp: new Date(),
        processed: false,
      });
    } catch (error) {
      console.error('Failed to create sync change for Contact:', error);
    }
  }
}

