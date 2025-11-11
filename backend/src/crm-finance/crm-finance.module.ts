import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CrmFinanceController } from "./crm-finance.controller";
import { CrmFinanceService } from "./crm-finance.service";
import { Transaction } from "./entities/transaction.entity";
import { PayoutRequest } from "./entities/payout-request.entity";
import { Invoice } from "./entities/invoice.entity";
import { PaymentsModule } from "../payments/payments.module";
import { OrdersModule } from "../orders/orders.module";
import { AuthModule } from "../auth/auth.module";
import { LoggerModule } from "../logger/logger.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, PayoutRequest, Invoice]),
    PaymentsModule, // Импортируем для использования PaymentsService
    OrdersModule, // Импортируем для расчета финансов из заказов
    AuthModule,
    LoggerModule,
  ],
  controllers: [CrmFinanceController],
  providers: [CrmFinanceService],
  exports: [CrmFinanceService],
})
export class CrmFinanceModule {}





