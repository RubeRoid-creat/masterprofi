import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";
import { User } from "../users/entities/user.entity";
import { Order } from "../orders/entities/order.entity";
import { Payment } from "../payments/entities/payment.entity";
import { MasterProfile } from "../mlm/entities/master-profile.entity";
import { Review } from "../reviews/entities/review.entity";
import { CacheModule } from "../cache/cache.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, Payment, MasterProfile, Review]),
    CacheModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}

