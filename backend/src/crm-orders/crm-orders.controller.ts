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
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CrmOrdersService } from "./crm-orders.service";
import { Request } from "express";

@ApiTags("CRM Orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("v1/orders")
export class CrmOrdersController {
  constructor(private readonly ordersService: CrmOrdersService) {}

  @Get()
  @ApiOperation({ summary: "Получить список заказов" })
  @ApiResponse({ status: 200, description: "Список заказов" })
  async findAll(@Query() query: any, @Req() req: Request) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
    }
    return this.ordersService.findAll(userId, query);
  }

  @Post()
  @ApiOperation({ summary: "Создать новый заказ" })
  @ApiResponse({ status: 201, description: "Заказ создан" })
  async create(@Body() orderData: any, @Req() req: Request) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
    }
    return this.ordersService.create(orderData, userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить заказ по ID" })
  @ApiResponse({ status: 200, description: "Информация о заказе" })
  async findOne(@Param("id") id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Изменить статус заказа" })
  @ApiResponse({ status: 200, description: "Статус обновлен" })
  async updateStatus(
    @Param("id") id: string,
    @Body() body: { status: string },
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
    }
    return this.ordersService.updateStatus(id, body.status, userId);
  }

  @Post(":id/assign")
  @ApiOperation({ summary: "Назначить мастера на заказ" })
  @ApiResponse({ status: 200, description: "Мастер назначен" })
  async assignMaster(
    @Param("id") id: string,
    @Body() body: { masterId: string },
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
    }
    return this.ordersService.assignMaster(id, body.masterId, userId);
  }

  @Get(":id/chat")
  @ApiOperation({ summary: "Получить историю чата заказа" })
  @ApiResponse({ status: 200, description: "История чата" })
  async getChatHistory(@Param("id") id: string) {
    return this.ordersService.getChatHistory(id);
  }
}

