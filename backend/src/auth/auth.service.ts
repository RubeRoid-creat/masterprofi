import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { User } from "../users/entities/user.entity";
import { RefreshToken } from "./entities/refresh-token.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuditService } from "../audit/audit.service";
import { AuditAction } from "../audit/entities/audit-log.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService
  ) {}

  async validateUser(emailOrPhone: string, password: string): Promise<any> {
    // Проверяем, является ли ввод email или телефоном
    const isEmail = emailOrPhone.includes('@');
    
    let user;
    if (isEmail) {
      // Поиск по email
      user = await this.usersRepository.findOne({ where: { email: emailOrPhone.toLowerCase().trim() } });
    } else {
      // Убираем все символы кроме цифр для поиска по телефону
      const phoneNumber = emailOrPhone.replace(/\D/g, '');
      // Ищем по телефону с разными форматами (с + и без)
      user = await this.usersRepository.findOne({
        where: [
          { phone: phoneNumber },
          { phone: `+${phoneNumber}` },
          { phone: phoneNumber.replace(/^8/, '7') }, // Заменяем 8 на 7 для российских номеров
        ],
      });
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    // Поддерживаем email, phone или emailOrPhone
    const emailOrPhone = loginDto.email || loginDto.phone || loginDto.emailOrPhone;
    
    if (!emailOrPhone) {
      throw new UnauthorizedException("Email or phone is required");
    }

    const user = await this.validateUser(emailOrPhone, loginDto.password);

    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(
      user.id,
      ipAddress,
      userAgent
    );

    // Логирование входа
    await this.auditService.log(AuditAction.LOGIN, "user", {
      userId: user.id,
      description: `User ${user.email} logged in`,
      ipAddress,
      userAgent,
    });

    // Формируем имя пользователя из firstName и lastName
    const userName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || user.lastName || user.email;

    return {
      access_token: accessToken,
      token: accessToken, // Добавляем для совместимости с мобильным приложением
      refresh_token: refreshToken.token,
      refreshToken: refreshToken.token, // Добавляем для совместимости
      expiresIn: 3600, // Добавляем для совместимости
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: userName, // Добавляем name для совместимости
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshToken,
        isActive: true,
        expiresAt: MoreThan(new Date()),
      },
      relations: ["user"],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const user = tokenRecord.user;
    const payload = { email: user.email, sub: user.id, role: user.role };

    const newAccessToken = this.jwtService.sign(payload);

    // Логирование обновления токена
    await this.auditService.log(AuditAction.TOKEN_REFRESH, "user", {
      userId: user.id,
      description: `User ${user.email} refreshed access token`,
      ipAddress: tokenRecord.ipAddress,
      userAgent: tokenRecord.userAgent,
    });

    // Возвращаем новый access token и тот же refresh token
    return {
      access_token: newAccessToken,
      token: newAccessToken, // Добавляем для совместимости
      refresh_token: refreshToken, // Возвращаем тот же refresh token
      refreshToken: refreshToken, // Добавляем для совместимости
      expiresIn: 3600, // Добавляем для совместимости
    };
  }

  async logout(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ["user"],
    });

    if (tokenRecord) {
      tokenRecord.isActive = false;
      await this.refreshTokenRepository.save(tokenRecord);

      await this.auditService.log(AuditAction.LOGOUT, "user", {
        userId: tokenRecord.userId,
        description: `User ${tokenRecord.user.email} logged out`,
      });
    }

    return { message: "Logged out successfully" };
  }

  async logoutAll(userId: string) {
    await this.refreshTokenRepository.update(
      { userId, isActive: true },
      { isActive: false }
    );

    await this.auditService.log(AuditAction.LOGOUT, "user", {
      userId,
      description: `All sessions revoked for user`,
    });

    return { message: "All sessions revoked successfully" };
  }

  private async generateRefreshToken(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<RefreshToken> {
    const expiresIn =
      this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") || "30d";
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days

    // Генерация уникального токена
    const token = this.jwtService.sign(
      { sub: userId, type: "refresh" },
      {
        secret:
          this.configService.get<string>("JWT_REFRESH_SECRET") ||
          this.configService.get<string>("JWT_SECRET") ||
          "dev-refresh-secret",
        expiresIn,
      }
    );

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      email: registerDto.email,
      phone: registerDto.phone,
      passwordHash: hashedPassword,
      role: registerDto.role,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    const savedUser = await this.usersRepository.save(user);

    // Логирование регистрации
    await this.auditService.log(AuditAction.REGISTER, "user", {
      userId: savedUser.id,
      entityId: savedUser.id,
      description: `New user registered: ${savedUser.email}`,
      newValues: {
        email: savedUser.email,
        role: savedUser.role,
      },
      ipAddress,
      userAgent,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = savedUser;
    return result;
  }

  /**
   * Смена пароля пользователя
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Текущий пароль неверен");
    }

    // Хешируем новый пароль
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    user.passwordHash = hashedNewPassword;
    await this.usersRepository.save(user);

    // Логируем смену пароля
    await this.auditService.log(AuditAction.USER_UPDATE, "user", {
      userId,
      entityId: userId,
      description: "Пароль пользователя изменен",
      ipAddress: undefined,
      userAgent: undefined,
    });
  }
}
