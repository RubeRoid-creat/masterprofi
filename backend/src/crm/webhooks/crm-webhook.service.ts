import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SyncQueue, SyncQueueStatus, SyncOperation } from "../entities/sync-queue.entity";
import { NotificationGateway } from "../../notification/notification.gateway";

@Injectable()
export class CrmWebhookService {
  constructor(
    @InjectRepository(SyncQueue)
    private syncQueueRepository: Repository<SyncQueue>,
    private notificationGateway: NotificationGateway
  ) {}

  /**
   * Обработка webhook обновления контакта
   */
  async handleContactUpdated(
    contactId: string,
    timestamp: string,
    data?: any
  ): Promise<{ status: string; queueId: string }> {
    const queueItem = this.syncQueueRepository.create({
      entityType: "contact",
      entityId: contactId,
      operation: SyncOperation.UPDATE,
      payload: {
        type: "contact_updated",
        contact_id: contactId,
        timestamp,
        data,
      },
      status: SyncQueueStatus.PENDING,
      createdAt: new Date(),
    });

    await this.syncQueueRepository.save(queueItem);

    // Немедленно уведомляем мобильные приложения
    this.notificationGateway.emitDataSync("contact", "updated", {
      id: contactId,
      timestamp,
      data,
    });

    return {
      status: "queued",
      queueId: queueItem.id,
    };
  }

  /**
   * Обработка webhook создания контакта
   */
  async handleContactCreated(
    contactId: string,
    timestamp: string,
    data?: any
  ): Promise<{ status: string; queueId: string }> {
    const queueItem = this.syncQueueRepository.create({
      entityType: "contact",
      entityId: contactId,
      operation: SyncOperation.CREATE,
      payload: {
        type: "contact_created",
        contact_id: contactId,
        timestamp,
        data,
      },
      status: SyncQueueStatus.PENDING,
      createdAt: new Date(),
    });

    await this.syncQueueRepository.save(queueItem);

    // Немедленно уведомляем мобильные приложения
    this.notificationGateway.emitDataSync("contact", "created", {
      id: contactId,
      timestamp,
      data,
    });

    return {
      status: "queued",
      queueId: queueItem.id,
    };
  }

  /**
   * Обработка webhook обновления сделки
   */
  async handleDealUpdated(
    dealId: string,
    timestamp: string,
    data?: any
  ): Promise<{ status: string; queueId: string }> {
    const queueItem = this.syncQueueRepository.create({
      entityType: "deal",
      entityId: dealId,
      operation: SyncOperation.UPDATE,
      payload: {
        type: "deal_updated",
        deal_id: dealId,
        timestamp,
        data,
      },
      status: SyncQueueStatus.PENDING,
      createdAt: new Date(),
    });

    await this.syncQueueRepository.save(queueItem);

    // Немедленно уведомляем мобильные приложения
    this.notificationGateway.emitDataSync("deal", "updated", {
      id: dealId,
      timestamp,
      data,
    });

    return {
      status: "queued",
      queueId: queueItem.id,
    };
  }

  /**
   * Обработка webhook создания сделки
   */
  async handleDealCreated(
    dealId: string,
    timestamp: string,
    data?: any
  ): Promise<{ status: string; queueId: string }> {
    const queueItem = this.syncQueueRepository.create({
      entityType: "deal",
      entityId: dealId,
      operation: SyncOperation.CREATE,
      payload: {
        type: "deal_created",
        deal_id: dealId,
        timestamp,
        data,
      },
      status: SyncQueueStatus.PENDING,
      createdAt: new Date(),
    });

    await this.syncQueueRepository.save(queueItem);

    // Немедленно уведомляем мобильные приложения
    this.notificationGateway.emitDataSync("deal", "created", {
      id: dealId,
      timestamp,
      data,
    });

    return {
      status: "queued",
      queueId: queueItem.id,
    };
  }

  /**
   * Обработка webhook обновления задачи
   */
  async handleTaskUpdated(
    taskId: string,
    timestamp: string,
    data?: any
  ): Promise<{ status: string; queueId: string }> {
    const queueItem = this.syncQueueRepository.create({
      entityType: "task",
      entityId: taskId,
      operation: SyncOperation.UPDATE,
      payload: {
        type: "task_updated",
        task_id: taskId,
        timestamp,
        data,
      },
      status: SyncQueueStatus.PENDING,
      createdAt: new Date(),
    });

    await this.syncQueueRepository.save(queueItem);

    // Немедленно уведомляем мобильные приложения
    this.notificationGateway.emitDataSync("task", "updated", {
      id: taskId,
      timestamp,
      data,
    });

    return {
      status: "queued",
      queueId: queueItem.id,
    };
  }
}

