import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule as NestScheduleModule } from "@nestjs/schedule";
import { ScheduleController } from "./schedule.controller";
import { ScheduleService } from "./schedule.service";
import { ScheduleSlot } from "./entities/schedule-slot.entity";
import { Order } from "../orders/entities/order.entity";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleSlot, Order]),
    NestScheduleModule.forRoot(),
    NotificationModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
