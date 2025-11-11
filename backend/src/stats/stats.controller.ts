import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { StatsService } from "./stats.service";

@ApiTags("Stats")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get dashboard statistics" })
  @ApiResponse({ status: 200, description: "Returns dashboard stats" })
  async getDashboardStats() {
    try {
      return await this.statsService.getDashboardStats();
    } catch (error: any) {
      console.error("Error in stats.getDashboardStats:", error);
      throw error;
    }
  }
}

