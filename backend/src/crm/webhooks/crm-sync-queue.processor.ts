import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { SyncQueue, SyncQueueStatus } from "../entities/sync-queue.entity";
import { NotificationGateway } from "../../notification/notification.gateway";
import { RetryPolicyService } from "../services/retry-policy.service";
import { Cron, CronExpression } from "@nestjs/schedule";

/**
 * Фоновая задача для обработки очереди синхронизации
 * Аналог process_sync_queue() из Python примера
 */
@Injectable()
export class CrmSyncQueueProcessor {
  private readonly logger = new Logger(CrmSyncQueueProcessor.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(SyncQueue)
    private syncQueueRepository: Repository<SyncQueue>,
    private notificationGateway: NotificationGateway,
    private retryPolicy: RetryPolicyService
  ) {}

  /**
   * Обработка очереди синхронизации
   * Запускается каждые 30 секунд
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async processSyncQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Получаем следующие элементы очереди (статус PENDING)
      // Исключаем элементы, которые еще не должны обрабатываться (задержка еще не прошла)
      const now = new Date();
      const allPendingJobs = await this.syncQueueRepository.find({
        where: {
          status: SyncQueueStatus.PENDING,
        },
        order: {
          createdAt: "ASC",
        },
      });

      // Фильтруем элементы, для которых прошла задержка перед повторной попыткой
      const readyJobs = allPendingJobs.filter((job) => {
        const retryCount = job.retryCount || 0;
        
        // Если это первая попытка (retryCount = 0), обрабатываем сразу
        if (retryCount === 0) {
          return true;
        }

        // Вычисляем задержку для текущего retryCount
        // retryCount указывает на количество уже выполненных попыток
        // delay для следующей попытки рассчитывается на основе текущего retryCount
        const delay = this.retryPolicy.getNextRetryDelay(retryCount);
        
        // Проверяем, прошло ли достаточно времени с момента последнего обновления
        const timeSinceUpdate = now.getTime() - job.updatedAt.getTime();
        return timeSinceUpdate >= delay;
      });

      const pendingJobs = readyJobs.slice(0, 10); // Обрабатываем по 10 элементов за раз

      if (pendingJobs.length === 0) {
        return;
      }

      this.logger.log(`Processing ${pendingJobs.length} sync queue items`);

      for (const job of pendingJobs) {
        try {
          await this.processJob(job);
          
          // Помечаем как обработанный
          job.status = SyncQueueStatus.SENT;
          job.processedAt = new Date();
          await this.syncQueueRepository.save(job);

          this.logger.log(`Successfully processed job ${job.id}`);
        } catch (error: any) {
          this.logger.error(`Failed to process job ${job.id}:`, error);
          
          // Увеличиваем счетчик попыток
          job.retryCount = (job.retryCount || 0) + 1;
          
          // Проверяем, нужно ли делать повторную попытку
          const maxRetries = 10;
          if (this.retryPolicy.shouldRetry(job.retryCount, maxRetries)) {
            // Вычисляем задержку до следующей попытки
            const delay = this.retryPolicy.getNextRetryDelay(job.retryCount);
            const retryInfo = this.retryPolicy.getRetryInfo(job.retryCount, maxRetries);
            
            this.logger.warn(
              `Job ${job.id} will retry after ${delay}ms (${retryInfo.delaySeconds}s). Attempt ${job.retryCount}/${maxRetries}`
            );
            
            // Оставляем в статусе PENDING для повторной обработки
            job.status = SyncQueueStatus.PENDING;
            job.errorMessage = `Retry ${job.retryCount}/${maxRetries}: ${error.message || "Unknown error"}`;
          } else {
            // Превышен лимит попыток - помечаем как ошибку
            job.status = SyncQueueStatus.ERROR;
            job.errorMessage = error.message || "Unknown error";
            this.logger.error(`Job ${job.id} exceeded max retries (${maxRetries})`);
          }
          
          await this.syncQueueRepository.save(job);
        }
      }
    } catch (error) {
      this.logger.error("Error processing sync queue:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Обработка одного задания из очереди
   */
  private async processJob(job: SyncQueue): Promise<void> {
    const payload = job.payload as any;
    const { type, contact_id, deal_id, task_id, timestamp, data } = payload;

    // Уведомляем мобильные приложения через WebSocket
    switch (type) {
      case "contact_updated":
      case "contact_created":
        this.notificationGateway.emitDataSync(
          "contact",
          type === "contact_created" ? "created" : "updated",
          {
            id: contact_id,
            timestamp,
            data,
          }
        );
        break;

      case "deal_updated":
      case "deal_created":
        this.notificationGateway.emitDataSync(
          "deal",
          type === "deal_created" ? "created" : "updated",
          {
            id: deal_id,
            timestamp,
            data,
          }
        );
        break;

      case "task_updated":
        this.notificationGateway.emitDataSync("task", "updated", {
          id: task_id,
          timestamp,
          data,
        });
        break;

      default:
        this.logger.warn(`Unknown job type: ${type}`);
    }
  }

  /**
   * Очистка старых обработанных элементов (старше 7 дней)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldQueueItems() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.syncQueueRepository.delete({
      status: SyncQueueStatus.SENT,
      processedAt: LessThan(sevenDaysAgo),
    });

    this.logger.log(`Cleaned up ${result.affected || 0} old queue items`);
  }
}

