import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User, UserRole } from "./entities/user.entity";
import { AuditService } from "../audit/audit.service";

describe("UsersService", () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let auditService: AuditService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
    logUserAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const createUserDto = {
        email: "newuser@example.com",
        password: "password123",
        firstName: "New",
        lastName: "User",
        role: UserRole.CLIENT,
      };

      const mockUser = {
        id: "1",
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const mockUsers: Partial<User>[] = [
        {
          id: "1",
          email: "user1@example.com",
          role: UserRole.CLIENT,
        },
        {
          id: "2",
          email: "user2@example.com",
          role: UserRole.MASTER,
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].email).toBe("user1@example.com");
    });
  });

  describe("findOne", () => {
    it("should return a user by id", async () => {
      const mockUser: Partial<User> = {
        id: "1",
        email: "test@example.com",
        role: UserRole.CLIENT,
        firstName: "Test",
        lastName: "User",
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne("1");

      expect(result).toBeDefined();
      expect(result.id).toBe("1");
      expect(result.email).toBe("test@example.com");
    });

    it("should throw NotFoundException when user does not exist", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("update", () => {
    it("should update user", async () => {
      const existingUser: Partial<User> = {
        id: "1",
        email: "test@example.com",
        firstName: "Old",
        lastName: "Name",
      };

      const updateDto = {
        firstName: "New",
        lastName: "Name",
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue({
        ...existingUser,
        ...updateDto,
      });

      const result = await service.update("1", updateDto);

      expect(result.firstName).toBe("New");
      expect(result.lastName).toBe("Name");
    });

    it("should throw NotFoundException when user does not exist", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update("non-existent", {})).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("remove", () => {
    it("should remove user", async () => {
      const mockUser: Partial<User> = {
        id: "1",
        email: "test@example.com",
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(mockUser);

      await service.remove("1");

      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it("should throw NotFoundException when user does not exist", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove("non-existent")).rejects.toThrow(
        NotFoundException
      );
    });
  });
});

