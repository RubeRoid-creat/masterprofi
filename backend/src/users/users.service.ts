import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { AuditService } from "../audit/audit.service";
import { AuditLog } from "../audit/entities/audit-log.entity";
import { NotificationGateway } from "../notification/notification.gateway";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private auditService: AuditService,
    private notificationGateway: NotificationGateway
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);
    
    // Отправляем WebSocket событие
    this.notificationGateway.emitUserCreated({
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      createdAt: savedUser.createdAt,
    });
    
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        "id",
        "email",
        "phone",
        "role",
        "firstName",
        "lastName",
        "isActive",
        "createdAt",
      ],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        "id",
        "email",
        "phone",
        "role",
        "firstName",
        "lastName",
        "avatar",
        "isActive",
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    
    // Отправляем WebSocket событие
    this.notificationGateway.emitUserUpdated({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      isActive: updatedUser.isActive,
      updatedAt: updatedUser.updatedAt,
    });
    
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  /**
   * Обновление профиля текущего пользователя
   */
  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findOne(id);
    const oldValues = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
    };

    // Проверка на дублирование email
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateProfileDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException("Email уже используется другим пользователем");
      }
    }

    Object.assign(user, updateProfileDto);
    const updatedUser = await this.usersRepository.save(user);

    // Логируем изменение профиля
    await this.auditService.log(
      "user_update" as any,
      "user",
      {
        userId: id,
        entityId: id,
        oldValues,
        newValues: {
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
        },
        description: "Обновлен профиль пользователя",
      }
    );

    // Отправляем WebSocket событие
    this.notificationGateway.emitProfileUpdated(id, {
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      updatedAt: updatedUser.updatedAt,
    });

    return updatedUser;
  }

  /**
   * Получение истории активности пользователя
   */
  async getActivityHistory(userId: string): Promise<AuditLog[]> {
    return this.auditService.findByUserId(userId, 100);
  }
}
