import { Module } from "@nestjs/common";
import { NotificationGateway } from "./notification.gateway";
import { NotificationService } from "./notification.service";
import { PushService } from "./push.service";
import { NotificationController } from "./notification.controller";
import { LoggerModule } from "../logger/logger.module";

@Module({
  imports: [LoggerModule],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService, PushService],
  exports: [NotificationGateway, NotificationService, PushService],
})
export class NotificationModule {}
