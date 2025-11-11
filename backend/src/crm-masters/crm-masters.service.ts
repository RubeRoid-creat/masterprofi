import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Master } from "./entities/master.entity";
import { MasterSkill } from "./entities/master-skill.entity";
import { MasterCertificate } from "./entities/master-certificate.entity";
import { UsersService } from "../users/users.service";
import { OrdersService } from "../orders/orders.service";
import { UserRole } from "../users/entities/user.entity";

@Injectable()
export class CrmMastersService {
  constructor(
    @InjectRepository(Master)
    private masterRepository: Repository<Master>,
    @InjectRepository(MasterSkill)
    private skillRepository: Repository<MasterSkill>,
    @InjectRepository(MasterCertificate)
    private certificateRepository: Repository<MasterCertificate>,
    private usersService: UsersService,
    private ordersService: OrdersService
  ) {}

  async findAll(query: any) {
    const {
      page = 1,
      pageSize = 20,
      isActive,
      isAvailable,
      rank,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = query;

    // Получаем всех мастеров из Users (role = 'master')
    const allUsers = await this.usersService.findAll();
    let masters = allUsers.filter((user) => user.role === UserRole.MASTER);

    // Применяем фильтр по isActive
    if (isActive !== undefined) {
      const activeFilter = isActive === "true" || isActive === true;
      masters = masters.filter((user) => user.isActive === activeFilter);
    }

    // Сортировка
    masters.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      if (!aValue || !bValue) return 0;
      if (sortOrder === "ASC") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Пагинация
    const total = masters.length;
    const skip = (page - 1) * pageSize;
    const data = masters.slice(skip, skip + pageSize);

    // Получаем дополнительные данные из CRM entities (skills, certificates)
    const dataWithExtras = await Promise.all(
      data.map(async (user) => {
        const [skills, certificates] = await Promise.all([
          this.skillRepository.find({
            where: { masterId: user.id },
          }),
          this.certificateRepository.find({
            where: { masterId: user.id },
          }),
        ]);

        return {
          ...user,
          skills,
          certificates,
        };
      })
    );

    return {
      data: dataWithExtras,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    // Получаем пользователя из Users
    const user = await this.usersService.findOne(id);
    
    // Проверяем, что это мастер
    if (user.role !== UserRole.MASTER) {
      throw new NotFoundException(`User with ID ${id} is not a master`);
    }

    // Получаем дополнительные данные из CRM entities
    const [skills, certificates] = await Promise.all([
      this.skillRepository.find({
        where: { masterId: id },
      }),
      this.certificateRepository.find({
        where: { masterId: id },
      }),
    ]);

    return {
      ...user,
      skills,
      certificates,
    };
  }

  async create(masterData: any) {
    // Создаем пользователя через UsersService
    const user = await this.usersService.create({
      email: masterData.email || `${masterData.firstName}.${masterData.lastName}@temp.masterprofi.com`,
      password: masterData.password || Math.random().toString(36).slice(-12),
      role: UserRole.MASTER,
      firstName: masterData.firstName,
      lastName: masterData.lastName,
      phone: masterData.phone,
    });

    // Возвращаем созданного пользователя с дополнительными данными
    return this.findOne(user.id);
  }

  async getPerformanceMetrics(masterId: string) {
    const master = await this.findOne(masterId);
    
    // Получаем все заказы мастера через OrdersService
    const allOrders = await this.ordersService.findAll();
    const masterOrders = allOrders.filter((order) => order.masterId === masterId);
    
    const totalOrders = masterOrders.length;
    const completedOrders = masterOrders.filter((order) => order.status === "completed").length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Рассчитываем средний рейтинг (TODO: из reviews модуля)
    const averageRating = 0; // TODO: получить из reviews

    return {
      masterId,
      completionRate: Math.round(completionRate * 100) / 100,
      averageRating,
      responseTime: 0, // TODO: Calculate from order assignments
      totalOrders,
      completedOrders,
      rank: "junior", // TODO: рассчитать на основе метрик
      commissionRate: 0.1, // TODO: получить из конфигурации
    };
  }

  async updateAvailability(masterId: string, data: { available: boolean; schedule?: any }) {
    const master = await this.findOne(masterId);
    
    // Обновляем доступность через UsersService (можно использовать metadata поле)
    // Или сохраняем в отдельной таблице Master
    // Для простоты обновляем в Master entity
    const masterEntity = await this.masterRepository.findOne({ where: { id: masterId } });
    if (masterEntity) {
      masterEntity.isAvailable = data.available;
      if (data.schedule) {
        masterEntity.schedule = data.schedule;
      }
      await this.masterRepository.save(masterEntity);
    }

    return {
      ...master,
      isAvailable: data.available,
      schedule: data.schedule,
    };
  }
}

