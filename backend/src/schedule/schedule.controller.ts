import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ScheduleService } from "./schedule.service";
import { CreateScheduleSlotDto } from "./dto/create-schedule-slot.dto";
import { BookSlotDto } from "./dto/book-slot.dto";

@ApiTags("schedule")
@Controller("schedule")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post("slots/generate")
  @ApiOperation({ summary: "Generate schedule slots for master" })
  @ApiResponse({ status: 201, description: "Slots created" })
  async generateSlots(
    @Body()
    body: {
      masterId: string;
      startDate: string;
      endDate: string;
      slotDurationMinutes?: number;
      workingHours?: { start: string; end: string };
    },
    @Req() req: any
  ) {
    // Только мастер может создавать свои слоты или админ
    const userId = req.user?.id;
    if (body.masterId !== userId && req.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return this.scheduleService.createSlots(
      body.masterId,
      new Date(body.startDate),
      new Date(body.endDate),
      body.slotDurationMinutes,
      body.workingHours
    );
  }

  @Get("masters/:masterId/slots")
  @ApiOperation({ summary: "Get master schedule slots" })
  @ApiResponse({ status: 200, description: "Returns slots" })
  async getMasterSlots(
    @Param("masterId") masterId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("availableOnly") availableOnly?: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (availableOnly === "true") {
      return this.scheduleService.getAvailableSlots(masterId, start, end);
    }

    return this.scheduleService.getMasterSlots(masterId, start, end);
  }

  @Post("book")
  @ApiOperation({ summary: "Book a time slot for an order" })
  @ApiResponse({ status: 201, description: "Slot booked" })
  async bookSlot(@Body() bookSlotDto: BookSlotDto) {
    return this.scheduleService.bookSlot(bookSlotDto);
  }

  @Patch("slots/:slotId/block")
  @ApiOperation({ summary: "Block a slot" })
  @ApiResponse({ status: 200, description: "Slot blocked" })
  async blockSlot(@Param("slotId") slotId: string, @Req() req: any) {
    const masterId = req.user?.id;
    return this.scheduleService.blockSlot(slotId, masterId);
  }

  @Patch("slots/:slotId/unblock")
  @ApiOperation({ summary: "Unblock a slot" })
  @ApiResponse({ status: 200, description: "Slot unblocked" })
  async unblockSlot(@Param("slotId") slotId: string, @Req() req: any) {
    const masterId = req.user?.id;
    return this.scheduleService.unblockSlot(slotId, masterId);
  }

  @Delete("orders/:orderId/release")
  @ApiOperation({ summary: "Release slots for cancelled order" })
  @ApiResponse({ status: 200, description: "Slots released" })
  async releaseSlots(@Param("orderId") orderId: string) {
    await this.scheduleService.releaseSlot(orderId);
    return { message: "Слоты освобождены" };
  }

  @Get("masters/:masterId/upcoming")
  @ApiOperation({ summary: "Get upcoming orders for master" })
  @ApiResponse({ status: 200, description: "Returns upcoming orders" })
  async getUpcomingOrders(
    @Param("masterId") masterId: string,
    @Query("limit") limit?: string
  ) {
    return this.scheduleService.getUpcomingOrders(
      masterId,
      limit ? parseInt(limit) : 10
    );
  }

  @Get("clients/:clientId/upcoming")
  @ApiOperation({ summary: "Get upcoming orders for client" })
  @ApiResponse({ status: 200, description: "Returns upcoming orders" })
  async getUpcomingOrdersForClient(
    @Param("clientId") clientId: string,
    @Query("limit") limit?: string
  ) {
    return this.scheduleService.getUpcomingOrdersForClient(
      clientId,
      limit ? parseInt(limit) : 10
    );
  }
}

