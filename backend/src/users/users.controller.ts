import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    try {
      return await this.usersService.findAll();
    } catch (error: any) {
      console.error("Error in users.findAll:", error);
      throw error;
    }
  }

  // Профиль пользователя должен быть ПЕРЕД маршрутом :id, чтобы не перехватывался
  @Get("profile")
  @ApiOperation({ summary: "Получить профиль текущего пользователя" })
  getProfile(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.usersService.findOne(userId);
  }

  @Patch("profile")
  @ApiOperation({ summary: "Обновить профиль текущего пользователя" })
  updateProfile(@Req() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = (req as any).user?.id;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Get("profile/activity")
  @ApiOperation({ summary: "Получить историю активности пользователя" })
  async getActivityHistory(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.usersService.getActivityHistory(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
