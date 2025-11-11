import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { CrmCustomersService } from "./crm-customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { Request } from "express";

@ApiTags("CRM Customers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("v1/customers")
export class CrmCustomersController {
  constructor(private readonly customersService: CrmCustomersService) {}

  @Get()
  @ApiOperation({ summary: "Получить список клиентов" })
  @ApiResponse({ status: 200, description: "Список клиентов" })
  async findAll(@Query() query: any, @Req() req: Request) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
    }
    return this.customersService.findAll(userId, query);
  }

  @Post()
  @ApiOperation({ summary: "Создать нового клиента" })
  @ApiResponse({ status: 201, description: "Клиент создан" })
  async create(@Body() dto: CreateCustomerDto, @Req() req: Request) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
    }
    return this.customersService.create(dto, userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить клиента по ID" })
  @ApiResponse({ status: 200, description: "Информация о клиенте" })
  async findOne(@Param("id") id: string) {
    return this.customersService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Обновить клиента" })
  @ApiResponse({ status: 200, description: "Клиент обновлен" })
  async update(@Param("id") id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить клиента" })
  @ApiResponse({ status: 200, description: "Клиент удален" })
  async remove(@Param("id") id: string) {
    return this.customersService.remove(id);
  }

  @Post(":id/orders")
  @ApiOperation({ summary: "Создать заказ для клиента" })
  @ApiResponse({ status: 201, description: "Заказ создан" })
  async createOrder(@Param("id") id: string, @Body() orderData: any) {
    return this.customersService.createOrderForCustomer(id, orderData);
  }

  @Get(":id/history")
  @ApiOperation({ summary: "Получить историю взаимодействий с клиентом" })
  @ApiResponse({ status: 200, description: "История клиента" })
  async getHistory(@Param("id") id: string) {
    return this.customersService.getCustomerHistory(id);
  }
}

