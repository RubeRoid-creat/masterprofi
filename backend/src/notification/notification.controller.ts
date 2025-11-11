import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PushService } from "./push.service";

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationController {
  constructor(private readonly pushService: PushService) {}

  @Post("register-token")
  @ApiOperation({ summary: "Регистрация Push токена устройства" })
  async registerToken(
    @Req() req: any,
    @Body() body: { token: string; platform?: string }
  ) {
    const userId = req.user?.id || req.user?.userId;
    await this.pushService.registerToken(
      userId,
      body.token,
      body.platform || "web"
    );
    return { message: "Token registered successfully" };
  }

  @Post("send")
  @ApiOperation({ summary: "Отправка Push-уведомления (только для админов)" })
  async sendNotification(
    @Req() req: any,
    @Body() body: { userId: string; title: string; body: string; data?: any }
  ) {
    // Проверка прав администратора
    if (req.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await this.pushService.sendNotification(
      body.userId,
      body.title,
      body.body,
      body.data
    );
    return { message: "Notification sent successfully" };
  }
}

