import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "../logger/logger.service";

interface PushToken {
  userId: string;
  token: string;
  platform: "ios" | "android" | "web";
}

@Injectable()
export class PushService {
  private tokens: Map<string, PushToken> = new Map();

  constructor(
    private configService: ConfigService,
    private logger: LoggerService
  ) {}

  /**
   * Регистрация Push токена пользователя
   */
  async registerToken(userId: string, token: string, platform: string): Promise<void> {
    this.tokens.set(userId, {
      userId,
      token,
      platform: platform as "ios" | "android" | "web",
    });

    this.logger.log(`Push token registered for user ${userId}`, "PushService");
  }

  /**
   * Отправка Push-уведомления пользователю
   */
  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    const tokenData = this.tokens.get(userId);
    if (!tokenData) {
      this.logger.warn(`No push token found for user ${userId}`, "PushService");
      return;
    }

    try {
      // Для Expo используем Expo Push Notification API
      const expoPushUrl = "https://exp.host/--/api/v2/push/send";
      const response = await fetch(expoPushUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          to: tokenData.token,
          sound: "default",
          title,
          body,
          data: data || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Push notification failed: ${response.statusText}`);
      }

      this.logger.log(`Push notification sent to user ${userId}`, "PushService");
    } catch (error: any) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error?.stack, "PushService");
    }
  }

  /**
   * Отправка уведомления нескольким пользователям
   */
  async sendBulkNotification(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    await Promise.all(
      userIds.map((userId) => this.sendNotification(userId, title, body, data))
    );
  }

  /**
   * Удаление токена пользователя
   */
  async removeToken(userId: string): Promise<void> {
    this.tokens.delete(userId);
    this.logger.log(`Push token removed for user ${userId}`, "PushService");
  }
}

