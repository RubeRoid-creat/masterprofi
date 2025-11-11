import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import * as crypto from "crypto";

export interface YooKassaPaymentRequest {
  amount: {
    value: string;
    currency: string;
  };
  description?: string;
  confirmation: {
    type: string;
    return_url: string;
  };
  metadata?: Record<string, string>;
  receipt?: {
    customer: {
      email?: string;
      phone?: string;
    };
    items: Array<{
      description: string;
      quantity: string;
      amount: {
        value: string;
        currency: string;
      };
      vat_code?: number;
    }>;
  };
}

export interface YooKassaPaymentResponse {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  description?: string;
  metadata?: Record<string, string>;
  paid: boolean;
  created_at: string;
  confirmation?: {
    confirmation_url?: string;
    confirmation_token?: string;
  };
}

@Injectable()
export class YooKassaService {
  private readonly logger = new Logger(YooKassaService.name);
  private readonly apiClient: AxiosInstance;
  private readonly shopId: string;
  private readonly secretKey: string;
  private readonly webhookUrl: string;

  constructor(private configService: ConfigService) {
    this.shopId = this.configService.get<string>("YOOKASSA_SHOP_ID") || "";
    this.secretKey =
      this.configService.get<string>("YOOKASSA_SECRET_KEY") || "";
    this.webhookUrl =
      this.configService.get<string>("YOOKASSA_WEBHOOK_URL") ||
      `${
        this.configService.get<string>("BACKEND_URL") || "http://localhost:3000"
      }/api/payments/yookassa/webhook`;

    // Создаем axios клиент с базовой аутентификацией
    this.apiClient = axios.create({
      baseURL: "https://api.yookassa.ru/v3",
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: this.shopId,
        password: this.secretKey,
      },
    });

    if (!this.shopId || !this.secretKey) {
      this.logger.warn(
        "YooKassa credentials not configured. Payment operations will fail."
      );
    }
  }

  /**
   * Создать платеж в YooKassa
   */
  async createPayment(
    amount: number,
    description: string,
    returnUrl: string,
    metadata?: Record<string, string>,
    email?: string
  ): Promise<YooKassaPaymentResponse> {
    if (!this.shopId || !this.secretKey) {
      throw new BadRequestException("YooKassa не настроен");
    }

    const paymentRequest: YooKassaPaymentRequest = {
      amount: {
        value: amount.toFixed(2),
        currency: "RUB",
      },
      description: description.substring(0, 128), // YooKassa limit
      confirmation: {
        type: "redirect",
        return_url: returnUrl,
      },
      metadata: metadata || {},
    };

    // Добавляем чек, если есть email
    if (email) {
      paymentRequest.receipt = {
        customer: {
          email: email,
        },
        items: [
          {
            description: description.substring(0, 128),
            quantity: "1",
            amount: {
              value: amount.toFixed(2),
              currency: "RUB",
            },
            vat_code: 1, // НДС 20%
          },
        ],
      };
    }

    try {
      const response = await this.apiClient.post<YooKassaPaymentResponse>(
        "/payments",
        paymentRequest
      );
      this.logger.log(`Payment created: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error creating payment: ${
          error.response?.data?.message || error.message
        }`
      );
      throw new BadRequestException(
        `Ошибка создания платежа: ${
          error.response?.data?.description || error.message
        }`
      );
    }
  }

  /**
   * Получить информацию о платеже
   */
  async getPayment(paymentId: string): Promise<YooKassaPaymentResponse> {
    if (!this.shopId || !this.secretKey) {
      throw new BadRequestException("YooKassa не настроен");
    }

    try {
      const response = await this.apiClient.get<YooKassaPaymentResponse>(
        `/payments/${paymentId}`
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error getting payment: ${
          error.response?.data?.message || error.message
        }`
      );
      throw new BadRequestException(
        `Ошибка получения платежа: ${error.message}`
      );
    }
  }

  /**
   * Проверить подпись webhook от YooKassa
   */
  verifyWebhookSignature(
    body: any,
    signature: string,
    secretKey: string
  ): boolean {
    try {
      const dataString = JSON.stringify(body);
      const hash = crypto
        .createHmac("sha256", secretKey)
        .update(dataString)
        .digest("hex");

      return hash === signature;
    } catch (error) {
      this.logger.error(`Error verifying signature: ${error}`);
      return false;
    }
  }

  /**
   * Обработать webhook уведомление
   */
  parseWebhookNotification(body: any): {
    event: string;
    type: string;
    object: YooKassaPaymentResponse;
  } {
    return {
      event: body.event || "",
      type: body.type || "notification",
      object: body.object || {},
    };
  }
}

