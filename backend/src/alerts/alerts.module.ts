import { Module } from "@nestjs/common";
import { AlertsService } from "./alerts.service";
import { AlertsController } from "./alerts.controller";
import { LoggerModule } from "../logger/logger.module";
import { MetricsModule } from "../metrics/metrics.module";

@Module({
  imports: [LoggerModule, MetricsModule],
  providers: [AlertsService],
  controllers: [AlertsController],
  exports: [AlertsService],
})
export class AlertsModule {}

