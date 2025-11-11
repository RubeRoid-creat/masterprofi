import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UnauthorizedException, ConflictException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { User, UserRole } from "../users/entities/user.entity";
import { RefreshToken } from "./entities/refresh-token.entity";

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: "test-secret",
        JWT_EXPIRES_IN: "1h",
        JWT_REFRESH_SECRET: "test-refresh-secret",
        JWT_REFRESH_EXPIRES_IN: "30d",
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    refreshTokenRepository = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken)
    );
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUser", () => {
    it("should return user when credentials are valid", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const mockUser: Partial<User> = {
        id: "1",
        email: "test@example.com",
        passwordHash: hashedPassword,
        role: UserRole.CLIENT,
        firstName: "Test",
        lastName: "User",
        isActive: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser("test@example.com", "password123");

      expect(result).toBeDefined();
      expect(result.id).toBe("1");
      expect(result.email).toBe("test@example.com");
      expect(result.passwordHash).toBeUndefined();
    });

    it("should throw UnauthorizedException when user does not exist", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser("test@example.com", "password123")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when password is invalid", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const mockUser: Partial<User> = {
        id: "1",
        email: "test@example.com",
        passwordHash: hashedPassword,
        role: UserRole.CLIENT,
        isActive: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.validateUser("test@example.com", "wrongpassword")
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("login", () => {
    it("should return access token and refresh token", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser: Partial<User> = {
        id: "1",
        email: "test@example.com",
        role: UserRole.CLIENT,
        firstName: "Test",
        lastName: "User",
      };

      const hashedPassword = await bcrypt.hash("password123", 10);
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
        isActive: true,
      } as User);

      mockJwtService.sign.mockReturnValue("access-token");
      mockRefreshTokenRepository.create.mockReturnValue({
        token: "refresh-token",
        userId: "1",
      });
      mockRefreshTokenRepository.save.mockResolvedValue({
        id: "token-id",
        token: "refresh-token",
        userId: "1",
      });

      const result = await service.login(loginDto);

      expect(result).toHaveProperty("access_token");
      expect(result).toHaveProperty("refresh_token");
      expect(result.access_token).toBe("access-token");
      expect(result.refresh_token).toBe("refresh-token");
    });
  });

  describe("register", () => {
    it("should create new user and return tokens", async () => {
      const registerDto = {
        email: "newuser@example.com",
        password: "password123",
        firstName: "New",
        lastName: "User",
        role: UserRole.CLIENT,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      const mockUser = {
        id: "1",
        ...registerDto,
        passwordHash: "hashed-password",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("access-token");
      mockRefreshTokenRepository.create.mockReturnValue({
        token: "refresh-token",
        userId: "1",
      });
      mockRefreshTokenRepository.save.mockResolvedValue({
        id: "token-id",
        token: "refresh-token",
        userId: "1",
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty("access_token");
      expect(result).toHaveProperty("refresh_token");
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it("should throw ConflictException when user already exists", async () => {
      const registerDto = {
        email: "existing@example.com",
        password: "password123",
        firstName: "Existing",
        lastName: "User",
        role: UserRole.CLIENT,
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: "1",
        email: "existing@example.com",
      } as User);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe("refreshToken", () => {
    it("should return new tokens when refresh token is valid", async () => {
      const mockRefreshToken = {
        id: "token-id",
        token: "refresh-token",
        userId: "1",
        expiresAt: new Date(Date.now() + 86400000),
      };

      const mockUser: Partial<User> = {
        id: "1",
        email: "test@example.com",
        role: UserRole.CLIENT,
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.verifyAsync.mockResolvedValue({ userId: "1" });
      mockJwtService.sign.mockReturnValue("new-access-token");
      mockJwtService.signAsync.mockResolvedValue("new-refresh-token");
      mockRefreshTokenRepository.save.mockResolvedValue({
        id: "new-token-id",
        token: "new-refresh-token",
        userId: "1",
      });

      const result = await service.refreshAccessToken("refresh-token");

      expect(result).toHaveProperty("access_token");
      expect(result.access_token).toBe("new-access-token");
    });

    it("should throw UnauthorizedException when refresh token is invalid", async () => {
      mockRefreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshAccessToken("invalid-token")).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe("logout", () => {
    it("should delete refresh token", async () => {
      mockRefreshTokenRepository.delete.mockResolvedValue({ affected: 1 });

      await service.logout("refresh-token");

      expect(mockRefreshTokenRepository.delete).toHaveBeenCalledWith({
        token: "refresh-token",
      });
    });
  });
});

