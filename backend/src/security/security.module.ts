import { Module } from "@nestjs/common";
import { SecurityController } from "./security.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [SecurityController],
})
export class SecurityModule {}

