import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CrmMastersService } from "./crm-masters.service";
import { Request } from "express";

@ApiTags("CRM Masters")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("v1/masters")
export class CrmMastersController {
  constructor(private readonly mastersService: CrmMastersService) {}

  @Get()
  @ApiOperation({ summary: "Получить список мастеров" })
  @ApiResponse({ status: 200, description: "Список мастеров" })
  async findAll(@Query() query: any) {
    return this.mastersService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: "Создать нового мастера" })
  @ApiResponse({ status: 201, description: "Мастер создан" })
  async create(@Body() masterData: any) {
    return this.mastersService.create(masterData);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить мастера по ID" })
  @ApiResponse({ status: 200, description: "Информация о мастере" })
  async findOne(@Param("id") id: string) {
    return this.mastersService.findOne(id);
  }

  @Get(":id/performance")
  @ApiOperation({ summary: "Получить метрики производительности мастера" })
  @ApiResponse({ status: 200, description: "Метрики производительности" })
  async getPerformance(@Param("id") id: string) {
    return this.mastersService.getPerformanceMetrics(id);
  }

  @Put(":id/availability")
  @ApiOperation({ summary: "Обновить доступность мастера" })
  @ApiResponse({ status: 200, description: "Доступность обновлена" })
  async updateAvailability(
    @Param("id") id: string,
    @Body() body: { available: boolean; schedule?: any }
  ) {
    return this.mastersService.updateAvailability(id, body);
  }
}

