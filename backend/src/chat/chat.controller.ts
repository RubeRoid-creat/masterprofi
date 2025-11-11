import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from "@nestjs/swagger";
import { Request } from "express";
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { v4 as uuidv4 } from "uuid";

@ApiTags("Chat")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("order/:orderId")
  @ApiOperation({ summary: "Get or create chat for order" })
  @ApiResponse({ status: 200, description: "Returns chat" })
  async getOrCreateChat(
    @Param("orderId") orderId: string,
    @Req() req: Request
  ) {
    return this.chatService.getOrCreateChat(orderId);
  }

  @Get(":chatId/messages")
  @ApiOperation({ summary: "Get chat messages" })
  @ApiResponse({ status: 200, description: "Returns messages" })
  async getMessages(
    @Param("chatId") chatId: string,
    @Req() req: Request,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    const userId = (req as any).user?.id;
    return this.chatService.getMessages(
      chatId,
      userId,
      limit ? parseInt(limit.toString()) : 50,
      offset ? parseInt(offset.toString()) : 0
    );
  }

  @Get("user/chats")
  @ApiOperation({ summary: "Get all user chats" })
  @ApiResponse({ status: 200, description: "Returns user chats" })
  async getUserChats(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.chatService.getUserChats(userId);
  }

  @Get(":chatId")
  @ApiOperation({ summary: "Get chat by ID" })
  @ApiResponse({ status: 200, description: "Returns chat" })
  async getChat(@Param("chatId") chatId: string, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.chatService.getChatById(chatId, userId);
  }

  @Post(":chatId/read")
  @ApiOperation({ summary: "Mark messages as read" })
  @ApiResponse({ status: 200, description: "Messages marked as read" })
  async markAsRead(@Param("chatId") chatId: string, @Req() req: Request) {
    const userId = (req as any).user?.id;
    await this.chatService.markAsRead(chatId, userId);
    return { success: true };
  }

  @Get("unread/count")
  @ApiOperation({ summary: "Get unread messages count" })
  @ApiResponse({ status: 200, description: "Returns unread count" })
  async getUnreadCount(@Req() req: Request) {
    const userId = (req as any).user?.id;
    const count = await this.chatService.getUnreadCount(userId);
    return { count };
  }

  @Post(":chatId/messages")
  @ApiOperation({ summary: "Send text message" })
  @ApiResponse({ status: 201, description: "Message created" })
  async sendMessage(
    @Param("chatId") chatId: string,
    @Body() createMessageDto: Omit<CreateMessageDto, "chatId">,
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;
    return this.chatService.createMessage(
      { ...createMessageDto, chatId },
      userId
    );
  }

  @Post(":chatId/files")
  @ApiOperation({ summary: "Upload file/image and send as message" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/chat",
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("Invalid file type"), false);
        }
      },
    })
  )
  async uploadFile(
    @Param("chatId") chatId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(image|application)\/(jpeg|png|gif|webp|pdf|msword|openxmlformats-officedocument)/,
          }),
        ],
      })
    )
    file: Express.Multer.File,
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;

    const isImage = file.mimetype.startsWith("image/");
    const fileUrl = `/uploads/chat/${file.filename}`;

    const message = await this.chatService.createMessage(
      {
        chatId,
        type: isImage ? ("image" as any) : ("file" as any),
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
      userId
    );

    return message;
  }
}


