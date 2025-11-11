import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { CrmController } from "./crm.controller";
import { CrmService } from "./crm.service";
import { CrmSyncService } from "./crm-sync.service";
import { RetryService } from "./services/retry.service";
import { RetryPolicyService } from "./services/retry-policy.service";
import { ConflictResolverService } from "./services/conflict-resolver.service";
import { CrmWebhookController } from "./webhooks/crm-webhook.controller";
import { CrmWebhookService } from "./webhooks/crm-webhook.service";
import { CrmSyncQueueProcessor } from "./webhooks/crm-sync-queue.processor";
import { Contact } from "./entities/contact.entity";
import { Deal } from "./entities/deal.entity";
import { Task } from "./entities/task.entity";
import { Communication } from "./entities/communication.entity";
import { Product } from "./entities/product.entity";
import { SyncQueue } from "./entities/sync-queue.entity";
import { SyncStatus } from "./entities/sync-status.entity";
import { SyncChanges } from "./entities/sync-changes.entity";
import { Device } from "./entities/device.entity";
import { CrmConnection } from "./entities/crm-connection.entity";
import { DeviceService } from "./services/device.service";
import { ContactSyncSubscriber } from "./subscribers/sync-changes.subscriber";
import { DealSyncSubscriber } from "./subscribers/deal-sync.subscriber";
import { UsersModule } from "../users/users.module";
import { OrdersModule } from "../orders/orders.module";
import { PaymentsModule } from "../payments/payments.module";
import { CrmCustomersModule } from "../crm-customers/crm-customers.module";
import { CrmOrdersModule } from "../crm-orders/crm-orders.module";
import { AuthModule } from "../auth/auth.module";
import { LoggerModule } from "../logger/logger.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    ScheduleModule.forRoot(), // Для cron задач
    TypeOrmModule.forFeature([
      Contact,
      Deal,
      Task,
      Communication,
      Product,
      SyncQueue,
      SyncStatus,
      SyncChanges,
      Device,
    ]),
    UsersModule, // Для получения клиентов и мастеров
    OrdersModule, // Для получения заказов
    PaymentsModule, // Для получения платежей
    CrmCustomersModule, // Для CRM данных клиентов
    CrmOrdersModule, // Для CRM данных заказов
    NotificationModule, // Для WebSocket уведомлений
    AuthModule,
    LoggerModule,
  ],
  controllers: [CrmController, CrmWebhookController],
  providers: [
    CrmService,
    CrmSyncService,
    RetryService,
    RetryPolicyService,
    ConflictResolverService,
    CrmWebhookService,
    CrmSyncQueueProcessor,
    DeviceService,
    {
      provide: ContactSyncSubscriber,
      useFactory: (dataSource: DataSource) => {
        return new ContactSyncSubscriber(dataSource);
      },
      inject: [DataSource],
    },
    {
      provide: DealSyncSubscriber,
      useFactory: (dataSource: DataSource) => {
        return new DealSyncSubscriber(dataSource);
      },
      inject: [DataSource],
    },
  ],
  exports: [CrmService, CrmSyncService, CrmWebhookService, DeviceService],
})
export class CrmModule {}

