import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Security")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("security")
export class SecurityController {
  @Get("wipe-status")
  @ApiOperation({ summary: "Get remote wipe status" })
  @ApiResponse({ status: 200, description: "Wipe status retrieved" })
  async getWipeStatus() {
    // По умолчанию возвращаем false - удаление не требуется
    // В production это можно подключить к административной панели или отдельной системе
    return {
      shouldWipe: false,
      wipeReason: null,
      timestamp: new Date().toISOString(),
    };
  }
}

