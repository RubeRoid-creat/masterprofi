import { Controller, Post, Body, Req, Get, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { Throttle } from "@nestjs/throttler";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UsersService } from "../users/users.service";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post("register")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: "Register new user" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get("user-agent");
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  @Post("login")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "Login successful" })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get("user-agent");
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    // Поддерживаем оба формата: refresh_token и refreshToken
    const refreshToken = refreshTokenDto.refresh_token || (refreshTokenDto as any).refreshToken;
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout user" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    // Поддерживаем оба формата: refresh_token и refreshToken
    const refreshToken = refreshTokenDto.refresh_token || (refreshTokenDto as any).refreshToken;
    if (!refreshToken) {
      // Если токен не передан, возвращаем успешный ответ (для совместимости)
      return { message: "Logged out successfully" };
    }
    return this.authService.logout(refreshToken);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Current user profile" })
  async getCurrentUser(@Req() req: Request) {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    if (!userId) {
      throw new Error("User ID not found in request");
    }
    return this.usersService.findOne(userId);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Смена пароля пользователя" })
  @ApiResponse({ status: 200, description: "Пароль успешно изменен" })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: Request) {
    const userId = (req as any).user?.id;
    await this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
    return { message: "Пароль успешно изменен" };
  }
}
