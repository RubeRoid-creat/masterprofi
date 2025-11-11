import {
  Controller,
  Post,
  Body,
  RawBodyRequest,
  Req,
  UseGuards,
  Get,
  Param,
} from "@nestjs/common";
import { Request } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { YooKassaService } from "./yookassa.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PaymentsService } from "../payments.service";
import { MlmService } from "../../mlm/mlm.service";
import { PaymentStatus } from "../entities/payment.entity";
import { CreateYooKassaPaymentDto } from "./dto/create-yookassa-payment.dto";

@ApiTags("YooKassa Payments")
@Controller("payments/yookassa")
export class YooKassaController {
  constructor(
    private readonly yooKassaService: YooKassaService,
    private readonly paymentsService: PaymentsService,
    private readonly mlmService: MlmService
  ) {}

  @Post("create")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Создать платеж через YooKassa" })
  @ApiResponse({ status: 201, description: "Платеж создан" })
  async createPayment(@Body() body: CreateYooKassaPaymentDto) {
    const returnUrl =
      body.returnUrl ||
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/payments/success`;

    // Создаем платеж в YooKassa
    const yooKassaPayment = await this.yooKassaService.createPayment(
      body.amount,
      body.description,
      returnUrl,
      {
        userId: body.userId,
        orderId: body.orderId || "",
      }
    );

    // Создаем запись о платеже в БД
    const payment = await this.paymentsService.create({
      userId: body.userId,
      amount: body.amount,
      currency: "RUB",
      description: body.description,
      orderId: body.orderId,
      transactionId: yooKassaPayment.id,
      gateway: "yookassa",
      gatewayData: JSON.stringify(yooKassaPayment),
      status: PaymentStatus.PENDING,
    });

    return {
      paymentId: payment.id,
      yooKassaPaymentId: yooKassaPayment.id,
      confirmationUrl: yooKassaPayment.confirmation?.confirmation_url,
      status: yooKassaPayment.status,
    };
  }

  @Get("status/:paymentId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Получить статус платежа" })
  async getPaymentStatus(@Param("paymentId") paymentId: string) {
    const payment = await this.yooKassaService.getPayment(paymentId);
    return payment;
  }

  @Post("webhook")
  @ApiOperation({ summary: "Webhook для обработки уведомлений от YooKassa" })
  @ApiResponse({ status: 200, description: "Webhook обработан" })
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const body = req.body;
    const notification = this.yooKassaService.parseWebhookNotification(body);

    // Обрабатываем только уведомления о платежах
    if (notification.type !== "notification" || !notification.object.id) {
      return { received: true };
    }

    const paymentId = notification.object.id;

    try {
      // Получаем актуальную информацию о платеже
      const yooKassaPayment = await this.yooKassaService.getPayment(paymentId);

      // Находим платеж в нашей БД по transactionId
      const payment = await this.paymentsService.findByTransactionId(paymentId);

      if (!payment) {
        console.error(`Payment not found for YooKassa ID: ${paymentId}`);
        return { received: true };
      }

      // Обновляем статус платежа
      let paymentStatus = PaymentStatus.PENDING;
      if (yooKassaPayment.status === "succeeded") {
        paymentStatus = PaymentStatus.COMPLETED;
      } else if (yooKassaPayment.status === "canceled") {
        paymentStatus = PaymentStatus.FAILED;
      }

      await this.paymentsService.update(payment.id, {
        status: paymentStatus,
        gatewayData: JSON.stringify(yooKassaPayment),
      });

      // Если платеж успешен, распределяем MLM комиссии
      if (paymentStatus === PaymentStatus.COMPLETED && payment.orderId) {
        await this.distributeMlmCommissions(payment);
      }

      return { received: true };
    } catch (error) {
      console.error("Error processing webhook:", error);
      return { received: true, error: "Processing failed" };
    }
  }

  /**
   * Распределить MLM комиссии после успешного платежа
   */
  private async distributeMlmCommissions(payment: any) {
    try {
      if (!payment.orderId || !payment.userId) {
        return;
      }

      const orderAmount = parseFloat(String(payment.amount));

      // Рассчитываем и распределяем MLM комиссии
      const bonuses = await this.mlmService.calculateOrderBonus(
        payment.orderId,
        orderAmount,
        payment.userId
      );

      console.log(
        `MLM commissions distributed for payment ${payment.id}: ${bonuses.length} bonuses created`
      );

      return bonuses;
    } catch (error) {
      console.error("Error distributing MLM commissions:", error);
      throw error;
    }
  }
}
