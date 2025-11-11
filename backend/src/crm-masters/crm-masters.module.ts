import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CrmMastersController } from "./crm-masters.controller";
import { CrmMastersService } from "./crm-masters.service";
import { Master } from "./entities/master.entity";
import { MasterSkill } from "./entities/master-skill.entity";
import { MasterCertificate } from "./entities/master-certificate.entity";
import { UsersModule } from "../users/users.module";
import { OrdersModule } from "../orders/orders.module";
import { AuthModule } from "../auth/auth.module";
import { LoggerModule } from "../logger/logger.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Master, MasterSkill, MasterCertificate]),
    UsersModule, // Импортируем для использования UsersService
    OrdersModule, // Импортируем для расчета метрик из заказов
    AuthModule,
    LoggerModule,
  ],
  controllers: [CrmMastersController],
  providers: [CrmMastersService],
  exports: [CrmMastersService],
})
export class CrmMastersModule {}





