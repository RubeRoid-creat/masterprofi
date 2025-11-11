import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GeolocationController } from "./geolocation.controller";
import { GeolocationService } from "./geolocation.service";
import { MasterProfile } from "../mlm/entities/master-profile.entity";
import { User } from "../users/entities/user.entity";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([MasterProfile, User]),
    OrdersModule,
  ],
  controllers: [GeolocationController],
  providers: [GeolocationService],
  exports: [GeolocationService],
})
export class GeolocationModule {}

