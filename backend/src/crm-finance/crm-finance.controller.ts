import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CrmFinanceService } from "./crm-finance.service";
import { Request } from "express";

@ApiTags("CRM Finance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("v1/finance")
export class CrmFinanceController {
  constructor(private readonly financeService: CrmFinanceService) {}

  @Get("overview")
  @ApiOperation({ summary: "Получить финансовый обзор" })
  @ApiResponse({ status: 200, description: "Финансовый обзор" })
  async getOverview(@Query() query: any, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.financeService.getOverview(userId, query);
  }

  @Get("commissions")
  @ApiOperation({ summary: "Получить список комиссий" })
  @ApiResponse({ status: 200, description: "Список комиссий" })
  async getCommissions(@Query() query: any) {
    return this.financeService.getCommissions(query);
  }

  @Post("payouts")
  @ApiOperation({ summary: "Создать запрос на выплату" })
  @ApiResponse({ status: 201, description: "Запрос на выплату создан" })
  async createPayout(@Body() payoutData: any, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.financeService.createPayout(payoutData, userId);
  }

  @Get("reports")
  @ApiOperation({ summary: "Получить финансовые отчеты" })
  @ApiResponse({ status: 200, description: "Финансовые отчеты" })
  async getReports(@Query() query: any) {
    return this.financeService.getReports(query);
  }
}

