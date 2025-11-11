import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { Order } from "./entities/order.entity";
import { OrderHistory } from "./entities/order-history.entity";
import { OrderHistoryService } from "./order-history.service";
import { OrderHistoryController } from "./order-history.controller";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderHistory]),
    NotificationModule,
  ],
  controllers: [OrdersController, OrderHistoryController],
  providers: [OrdersService, OrderHistoryService],
  exports: [OrdersService, OrderHistoryService],
})
export class OrdersModule {}
