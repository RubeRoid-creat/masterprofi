import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
} from "@nestjs/common";
import { Request } from "express";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  async findAll() {
    try {
      return await this.ordersService.findAll();
    } catch (error: any) {
      console.error("Error in orders.findAll:", error);
      // Если ошибка связана с UUID, возвращаем пустой массив вместо ошибки
      if (error.message?.includes("uuid") || error.message?.includes("syntax")) {
        console.warn("UUID error detected, returning empty array:", error.message);
        return [];
      }
      throw error;
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    try {
      return await this.ordersService.findOne(id);
    } catch (error: any) {
      console.error("Error in orders.findOne:", error);
      // Если ошибка связана с UUID, возвращаем 404
      if (error.message?.includes("uuid") || error.message?.includes("syntax")) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      throw error;
    }
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;
    return this.ordersService.update(id, updateOrderDto, userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.ordersService.remove(id);
  }
}
