import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { OrderHistoryService } from "./order-history.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Order History")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("orders/:orderId/history")
export class OrderHistoryController {
  constructor(private readonly orderHistoryService: OrderHistoryService) {}

  @Get()
  @ApiOperation({ summary: "Получить полную историю изменений заказа" })
  @ApiResponse({ status: 200, description: "История заказа" })
  async getOrderHistory(@Param("orderId") orderId: string) {
    try {
      return await this.orderHistoryService.getOrderHistory(orderId);
    } catch (error: any) {
      console.error("Error in getOrderHistory controller:", error);
      if (error.message?.includes("uuid") || error.message?.includes("syntax")) {
        return [];
      }
      throw error;
    }
  }

  @Get("status")
  @ApiOperation({ summary: "Получить историю изменений статусов" })
  @ApiResponse({ status: 200, description: "История статусов" })
  async getStatusHistory(@Param("orderId") orderId: string) {
    return this.orderHistoryService.getStatusHistory(orderId);
  }

  @Get("masters")
  @ApiOperation({ summary: "Получить историю назначений мастеров" })
  @ApiResponse({ status: 200, description: "История мастеров" })
  async getMasterHistory(@Param("orderId") orderId: string) {
    return this.orderHistoryService.getMasterHistory(orderId);
  }

  @Get("latest")
  @ApiOperation({ summary: "Получить последнее изменение заказа" })
  @ApiResponse({ status: 200, description: "Последнее изменение" })
  async getLatestChange(@Param("orderId") orderId: string) {
    return this.orderHistoryService.getLatestChange(orderId);
  }
}

