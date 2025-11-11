import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Req,
  Post,
  Body,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GeolocationService, NearestMasterResult, Coordinate } from "./geolocation.service";
import { OrdersService } from "../orders/orders.service";

@ApiTags("geolocation")
@Controller("geolocation")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GeolocationController {
  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly ordersService: OrdersService
  ) {}

  @Get("masters/nearest")
  @ApiOperation({ summary: "Find nearest masters" })
  @ApiResponse({ status: 200, description: "Returns nearest masters" })
  async findNearestMasters(
    @Query("latitude") latitude: string,
    @Query("longitude") longitude: string,
    @Query("radius") radius?: string,
    @Query("limit") limit?: string,
    @Query("specialization") specialization?: string
  ) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radiusKm = radius ? parseFloat(radius) : 50;
    const limitCount = limit ? parseInt(limit) : 10;

    return this.geolocationService.findNearestMasters(
      lat,
      lon,
      radiusKm,
      limitCount,
      specialization
    );
  }

  @Get("orders/:orderId/masters/nearest")
  @ApiOperation({ summary: "Find nearest masters for an order" })
  @ApiResponse({
    status: 200,
    description: "Returns nearest masters for the order",
  })
  async findNearestMastersForOrder(
    @Param("orderId") orderId: string,
    @Query("radius") radius?: string,
    @Query("limit") limit?: string
  ) {
    const order = await this.ordersService.findOne(orderId);

    if (!order.latitude || !order.longitude) {
      return {
        error: "Order does not have coordinates",
        masters: [],
      };
    }

    const radiusKm = radius ? parseFloat(radius) : 50;
    const limitCount = limit ? parseInt(limit) : 10;

    return this.geolocationService.findNearestMastersForOrder(
      parseFloat(String(order.latitude)),
      parseFloat(String(order.longitude)),
      radiusKm,
      limitCount
    );
  }

  @Post("route")
  @ApiOperation({ summary: "Create optimal route" })
  @ApiResponse({ status: 200, description: "Returns optimal route" })
  async createRoute(
    @Body()
    body: {
      startPoint: { latitude: number; longitude: number };
      points: { latitude: number; longitude: number }[];
    }
  ) {
    return this.geolocationService.createOptimalRoute(
      body.startPoint,
      body.points
    );
  }
}

