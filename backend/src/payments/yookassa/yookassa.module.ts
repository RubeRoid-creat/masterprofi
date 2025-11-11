import { Module } from "@nestjs/common";
import { YooKassaService } from "./yookassa.service";
import { YooKassaController } from "./yookassa.controller";
import { PaymentsModule } from "../payments.module";
import { MlmModule } from "../../mlm/mlm.module";

@Module({
  imports: [PaymentsModule, MlmModule],
  controllers: [YooKassaController],
  providers: [YooKassaService],
  exports: [YooKassaService],
})
export class YooKassaModule {}

