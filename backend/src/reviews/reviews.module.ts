import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { Review } from "./entities/review.entity";
import { MasterProfile } from "../mlm/entities/master-profile.entity";
import { Order } from "../orders/entities/order.entity";
import { CacheModule } from "../cache/cache.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, MasterProfile, Order]),
    CacheModule,
    NotificationModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}

