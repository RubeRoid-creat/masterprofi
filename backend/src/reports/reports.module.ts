import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { ExportService } from "./export.service";
import { Order } from "../orders/entities/order.entity";
import { Payment } from "../payments/entities/payment.entity";
import { MasterProfile } from "../mlm/entities/master-profile.entity";
import { Bonus } from "../mlm/entities/bonus.entity";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Payment, MasterProfile, Bonus, User]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ExportService],
  exports: [ReportsService, ExportService],
})
export class ReportsModule {}

