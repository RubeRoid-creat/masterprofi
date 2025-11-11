import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MlmController } from "./mlm.controller";
import { MlmService } from "./mlm.service";
import { MasterProfile } from "./entities/master-profile.entity";
import { Referral } from "./entities/referral.entity";
import { Bonus } from "./entities/bonus.entity";
import { User } from "../users/entities/user.entity";
import { CacheModule } from "../cache/cache.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([MasterProfile, Referral, Bonus, User]),
    CacheModule,
    NotificationModule,
  ],
  controllers: [MlmController],
  providers: [MlmService],
  exports: [MlmService],
})
export class MlmModule {}
