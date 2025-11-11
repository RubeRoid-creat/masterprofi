import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { Chat } from "./entities/chat.entity";
import { Message } from "./entities/message.entity";
import { Order } from "../orders/entities/order.entity";
import { User } from "../users/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, Order, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
    }),
    NotificationModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}



