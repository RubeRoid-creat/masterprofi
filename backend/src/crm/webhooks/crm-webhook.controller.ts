import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CrmWebhookService } from "./crm-webhook.service";

@ApiTags("CRM Webhooks")
@Controller("webhooks/crm")
export class CrmWebhookController {
  constructor(private readonly webhookService: CrmWebhookService) {}

  @Post("contact-updated")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Webhook для обновления контакта" })
  @ApiResponse({ status: 200, description: "Уведомление добавлено в очередь" })
  async handleContactUpdated(@Body() payload: { contact_id: string; timestamp: string; data?: any }) {
    return this.webhookService.handleContactUpdated(
      payload.contact_id,
      payload.timestamp,
      payload.data
    );
  }

  @Post("contact-created")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Webhook для создания контакта" })
  @ApiResponse({ status: 200, description: "Уведомление добавлено в очередь" })
  async handleContactCreated(@Body() payload: { contact_id: string; timestamp: string; data?: any }) {
    return this.webhookService.handleContactCreated(
      payload.contact_id,
      payload.timestamp,
      payload.data
    );
  }

  @Post("deal-updated")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Webhook для обновления сделки" })
  @ApiResponse({ status: 200, description: "Уведомление добавлено в очередь" })
  async handleDealUpdated(@Body() payload: { deal_id: string; timestamp: string; data?: any }) {
    return this.webhookService.handleDealUpdated(
      payload.deal_id,
      payload.timestamp,
      payload.data
    );
  }

  @Post("deal-created")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Webhook для создания сделки" })
  @ApiResponse({ status: 200, description: "Уведомление добавлено в очередь" })
  async handleDealCreated(@Body() payload: { deal_id: string; timestamp: string; data?: any }) {
    return this.webhookService.handleDealCreated(
      payload.deal_id,
      payload.timestamp,
      payload.data
    );
  }

  @Post("task-updated")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Webhook для обновления задачи" })
  @ApiResponse({ status: 200, description: "Уведомление добавлено в очередь" })
  async handleTaskUpdated(@Body() payload: { task_id: string; timestamp: string; data?: any }) {
    return this.webhookService.handleTaskUpdated(
      payload.task_id,
      payload.timestamp,
      payload.data
    );
  }
}

