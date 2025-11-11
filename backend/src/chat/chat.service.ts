import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, Not } from "typeorm";
import { Chat } from "./entities/chat.entity";
import { Message, MessageType } from "./entities/message.entity";
import { CreateMessageDto } from "./dto/create-message.dto";
import { CreateChatDto } from "./dto/create-chat.dto";
import { Order } from "../orders/entities/order.entity";
import { NotificationGateway } from "../notification/notification.gateway";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private notificationGateway: NotificationGateway
  ) {}

  // Создать или получить существующий чат для заказа
  async getOrCreateChat(orderId: string): Promise<Chat> {
    let chat = await this.chatRepository.findOne({
      where: { orderId, isArchived: false },
      relations: ["client", "master", "order"],
    });

    if (!chat) {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ["client", "master"],
      });

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      chat = this.chatRepository.create({
        orderId: order.id,
        clientId: order.clientId,
        masterId: order.masterId || null,
      });

      await this.chatRepository.save(chat);

      // Загружаем relations после создания
      chat = await this.chatRepository.findOne({
        where: { id: chat.id },
        relations: ["client", "master", "order"],
      });
    }

    return chat!;
  }

  // Создать сообщение
  async createMessage(
    createMessageDto: CreateMessageDto,
    senderId: string
  ): Promise<Message> {
    const chat = await this.chatRepository.findOne({
      where: { id: createMessageDto.chatId },
      relations: ["client", "master"],
    });

    if (!chat) {
      throw new NotFoundException("Chat not found");
    }

    // Проверяем, что пользователь имеет право писать в этот чат
    if (senderId !== chat.clientId && senderId !== chat.masterId) {
      throw new ForbiddenException("You don't have access to this chat");
    }

    // Валидация: текстовое сообщение должно иметь content
    if (
      (!createMessageDto.type || createMessageDto.type === MessageType.TEXT) &&
      !createMessageDto.content &&
      !createMessageDto.fileUrl
    ) {
      throw new BadRequestException("Message content or file is required");
    }

    const message = this.messageRepository.create({
      ...createMessageDto,
      senderId,
      type: createMessageDto.type || MessageType.TEXT,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Обновляем время последнего сообщения в чате
    await this.chatRepository.update(chat.id, {
      lastMessageAt: new Date(),
    });

    // Отправляем WebSocket событие
    this.notificationGateway.emitChatMessageCreated(chat.id, {
      id: savedMessage.id,
      chatId: savedMessage.chatId,
      senderId: savedMessage.senderId,
      content: savedMessage.content,
      type: savedMessage.type,
      fileUrl: savedMessage.fileUrl,
      createdAt: savedMessage.createdAt,
    });

    // Обновляем чат через WebSocket
    const updatedChat = await this.chatRepository.findOne({
      where: { id: chat.id },
      relations: ["client", "master", "order"],
    });
    if (updatedChat) {
      this.notificationGateway.emitChatUpdated({
        id: updatedChat.id,
        orderId: updatedChat.orderId,
        clientId: updatedChat.clientId,
        masterId: updatedChat.masterId,
        lastMessageAt: updatedChat.lastMessageAt,
      });
    }

    // Загружаем полную информацию о сообщении
    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ["sender", "chat"],
    }) as Promise<Message>;
  }

  // Получить сообщения чата
  async getMessages(
    chatId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ messages: Message[]; total: number }> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ["client", "master"],
    });

    if (!chat) {
      throw new NotFoundException("Chat not found");
    }

    // Проверяем доступ
    if (userId !== chat.clientId && userId !== chat.masterId) {
      throw new ForbiddenException("You don't have access to this chat");
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { chatId },
      relations: ["sender"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    // Отмечаем сообщения как прочитанные
    const unreadMessageIds = messages
      .filter(
        (m) => !m.isRead && m.senderId !== userId && m.type !== MessageType.SYSTEM
      )
      .map((m) => m.id);

    if (unreadMessageIds.length > 0) {
      await this.messageRepository
        .createQueryBuilder()
        .update(Message)
        .set({ isRead: true, readAt: new Date() })
        .where("id IN (:...ids)", { ids: unreadMessageIds })
        .execute();

      // Обновляем в кэше
      messages.forEach((m) => {
        if (unreadMessageIds.includes(m.id)) {
          m.isRead = true;
          m.readAt = new Date();
        }
      });
    }

    return {
      messages: messages.reverse(), // Возвращаем в хронологическом порядке
      total,
    };
  }

  // Получить чат по ID
  async getChatById(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ["client", "master", "order"],
    });

    if (!chat) {
      throw new NotFoundException("Chat not found");
    }

    if (userId !== chat.clientId && userId !== chat.masterId) {
      throw new ForbiddenException("You don't have access to this chat");
    }

    return chat;
  }

  // Получить все чаты пользователя
  async getUserChats(userId: string): Promise<Chat[]> {
    const chats = await this.chatRepository.find({
      where: [
        { clientId: userId, isArchived: false },
        { masterId: userId, isArchived: false },
      ],
      relations: ["client", "master", "order"],
      order: { lastMessageAt: "DESC", createdAt: "DESC" },
    });

    return chats;
  }

  // Получить чаты для заказа
  async getOrderChats(orderId: string): Promise<Chat[]> {
    return this.chatRepository.find({
      where: { orderId, isArchived: false },
      relations: ["client", "master"],
      order: { createdAt: "DESC" },
    });
  }

  // Отметить сообщения как прочитанные
  async markAsRead(chatId: string, userId: string): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where("chatId = :chatId", { chatId })
      .andWhere("senderId != :userId", { userId })
      .andWhere("isRead = :isRead", { isRead: false })
      .execute();
  }

  // Получить количество непрочитанных сообщений
  async getUnreadCount(userId: string): Promise<number> {
    const userChats = await this.chatRepository.find({
      where: [
        { clientId: userId, isArchived: false },
        { masterId: userId, isArchived: false },
      ],
    });

    if (userChats.length === 0) return 0;

    const chatIds = userChats.map((c) => c.id);

    return this.messageRepository.count({
      where: {
        chatId: In(chatIds),
        senderId: Not(userId),
        isRead: false,
        type: Not(MessageType.SYSTEM),
      },
    });
  }
}

