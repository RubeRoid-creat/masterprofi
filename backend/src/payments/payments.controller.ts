import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: "Create payment" })
  @ApiResponse({ status: 201, description: "Payment created successfully" })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all payments" })
  @ApiResponse({ status: 200, description: "Returns all payments" })
  async findAll() {
    try {
      return await this.paymentsService.findAll();
    } catch (error: any) {
      console.error("Error in payments.findAll:", error);
      throw error;
    }
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get payments by user ID" })
  @ApiResponse({ status: 200, description: "Returns user payments" })
  findByUserId(@Param("userId") userId: string) {
    return this.paymentsService.findByUserId(userId);
  }

  @Get("order/:orderId")
  @ApiOperation({ summary: "Get payments by order ID" })
  @ApiResponse({ status: 200, description: "Returns order payments" })
  findByOrderId(@Param("orderId") orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get payment by ID" })
  @ApiResponse({ status: 200, description: "Returns payment" })
  findOne(@Param("id") id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update payment" })
  @ApiResponse({ status: 200, description: "Payment updated successfully" })
  update(@Param("id") id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete payment" })
  @ApiResponse({ status: 200, description: "Payment deleted successfully" })
  remove(@Param("id") id: string) {
    return this.paymentsService.remove(id);
  }
}
