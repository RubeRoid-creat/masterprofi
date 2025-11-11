import { Controller, Get, Post, Param, UseGuards, Body } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { MlmService } from "./mlm.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("MLM")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("mlm")
export class MlmController {
  constructor(private readonly mlmService: MlmService) {}

  @Get("stats/:userId")
  @ApiOperation({ summary: "Get MLM statistics for user" })
  @ApiResponse({ status: 200, description: "Returns MLM stats" })
  async getUserStats(@Param("userId") userId: string) {
    return this.mlmService.getUserStats(userId);
  }

  @Get("structure/:userId")
  @ApiOperation({ summary: "Get MLM structure (referral tree)" })
  @ApiResponse({ status: 200, description: "Returns referral tree" })
  async getUserStructure(@Param("userId") userId: string) {
    return this.mlmService.getUserStructure(userId);
  }

  @Get("overall")
  @ApiOperation({ summary: "Get overall MLM statistics" })
  @ApiResponse({ status: 200, description: "Returns overall MLM stats" })
  async getOverallStats() {
    return this.mlmService.getOverallStats();
  }

  @Get("referral-code/:userId")
  @ApiOperation({ summary: "Get referral code for user" })
  @ApiResponse({ status: 200, description: "Returns referral code" })
  async getReferralCode(@Param("userId") userId: string) {
    const code = this.mlmService.generateReferralCode();
    return { userId, referralCode: code };
  }

  @Post("referral")
  @ApiOperation({ summary: "Create referral link" })
  @ApiResponse({ status: 201, description: "Referral created" })
  async createReferral(
    @Body() body: { referrerId: string; referredId: string }
  ) {
    try {
      return await this.mlmService.createReferral(
        body.referrerId,
        body.referredId
      );
    } catch (error) {
      console.error("Error creating referral:", error);
      throw error;
    }
  }

  @Get("bonuses/:userId")
  @ApiOperation({ summary: "Get bonuses for user" })
  @ApiResponse({ status: 200, description: "Returns user bonuses" })
  async getUserBonuses(@Param("userId") userId: string) {
    const stats = await this.mlmService.getUserStats(userId);
    return stats.bonuses;
  }

  @Post("calculate-commissions")
  @ApiOperation({ summary: "Calculate commissions in real-time (preview)" })
  @ApiResponse({ status: 200, description: "Returns calculated commissions" })
  async calculateCommissions(
    @Body()
    body: { orderId?: string; orderAmount: number; clientId: string }
  ) {
    return this.mlmService.calculateRealTimeCommissions(
      body.orderAmount,
      body.clientId
    );
  }

  @Post("process-payout")
  @ApiOperation({ summary: "Process automatic payout" })
  @ApiResponse({ status: 200, description: "Payout processed" })
  async processPayout(
    @Body() body: { userId: string; amount?: number }
  ) {
    return this.mlmService.processAutomaticPayout(
      body.userId,
      body.amount
    );
  }

  @Get("realtime-commissions/:userId")
  @ApiOperation({ summary: "Get real-time commission data" })
  @ApiResponse({
    status: 200,
    description: "Returns real-time commission information",
  })
  async getRealTimeCommissions(@Param("userId") userId: string) {
    return this.mlmService.getRealTimeCommissions(userId);
  }
}
