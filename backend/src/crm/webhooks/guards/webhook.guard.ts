import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Guard для защиты webhook endpoints
 * Можно добавить проверку подписи или токена
 */
@Injectable()
export class WebhookGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    // В development разрешаем все запросы
    if (process.env.NODE_ENV === "development") {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const webhookSecret = request.headers["x-webhook-secret"];
    const expectedSecret = this.configService.get("WEBHOOK_SECRET");

    // Проверяем секретный ключ
    if (!webhookSecret || webhookSecret !== expectedSecret) {
      return false;
    }

    return true;
  }
}

