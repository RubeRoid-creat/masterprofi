import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CrmOrdersController } from "./crm-orders.controller";
import { CrmOrdersService } from "./crm-orders.service";
import { Order } from "../orders/entities/order.entity";
import { OrderStatusHistory } from "./entities/order-status-history.entity";
import { OrdersModule } from "../orders/orders.module";
import { AuthModule } from "../auth/auth.module";
import { LoggerModule } from "../logger/logger.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderStatusHistory]),
    OrdersModule, // Импортируем для использования OrdersService
    AuthModule,
    LoggerModule,
  ],
  controllers: [CrmOrdersController],
  providers: [CrmOrdersService],
  exports: [CrmOrdersService],
})
export class CrmOrdersModule {}





