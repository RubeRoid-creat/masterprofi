import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CrmCustomersController } from "./crm-customers.controller";
import { CrmCustomersService } from "./crm-customers.service";
import { Customer } from "./entities/customer.entity";
import { CustomerContact } from "./entities/customer-contact.entity";
import { CustomerAddress } from "./entities/customer-address.entity";
import { CustomerNote } from "./entities/customer-note.entity";
import { CustomerDocument } from "./entities/customer-document.entity";
import { Order } from "../orders/entities/order.entity";
import { OrdersModule } from "../orders/orders.module";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { LoggerModule } from "../logger/logger.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      CustomerContact,
      CustomerAddress,
      CustomerNote,
      CustomerDocument,
      Order,
    ]),
    AuthModule,
    LoggerModule,
    OrdersModule,
    UsersModule, // Импортируем для использования UsersService
  ],
  controllers: [CrmCustomersController],
  providers: [CrmCustomersService],
  exports: [CrmCustomersService],
})
export class CrmCustomersModule {}

