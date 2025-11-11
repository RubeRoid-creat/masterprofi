import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Customer } from "./entities/customer.entity";
import { CustomerContact } from "./entities/customer-contact.entity";
import { CustomerAddress } from "./entities/customer-address.entity";
import { CustomerNote } from "./entities/customer-note.entity";
import { CustomerDocument } from "./entities/customer-document.entity";
import { Order } from "../orders/entities/order.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { UsersService } from "../users/users.service";
import { OrdersService } from "../orders/orders.service";
import { UserRole } from "../users/entities/user.entity";

@Injectable()
export class CrmCustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerContact)
    private contactRepository: Repository<CustomerContact>,
    @InjectRepository(CustomerAddress)
    private addressRepository: Repository<CustomerAddress>,
    @InjectRepository(CustomerNote)
    private noteRepository: Repository<CustomerNote>,
    @InjectRepository(CustomerDocument)
    private documentRepository: Repository<CustomerDocument>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private usersService: UsersService,
    private ordersService: OrdersService
  ) {}

  async findAll(userId: string, query: any) {
    const {
      page = 1,
      pageSize = 20,
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = query;

    // Получаем всех клиентов из Users (role = 'client')
    const allUsers = await this.usersService.findAll();
    let customers = allUsers.filter((user) => user.role === UserRole.CLIENT);

    // Применяем поиск
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Применяем фильтр по статусу (isActive)
    if (status === "active") {
      customers = customers.filter((user) => user.isActive);
    } else if (status === "inactive") {
      customers = customers.filter((user) => !user.isActive);
    }

    // Сортировка
    customers.sort((a, b) => {
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
    const total = customers.length;
    const skip = (page - 1) * pageSize;
    const data = customers.slice(skip, skip + pageSize);

    // Получаем дополнительные данные из CRM entities (notes, contacts, addresses)
    const dataWithExtras = await Promise.all(
      data.map(async (user) => {
        const [notes, contacts, addresses] = await Promise.all([
          this.noteRepository.find({
            where: { customerId: user.id },
            order: { createdAt: "DESC" },
            take: 5, // Последние 5 заметок
          }),
          this.contactRepository.find({
            where: { customerId: user.id },
          }),
          this.addressRepository.find({
            where: { customerId: user.id },
          }),
        ]);

        return {
          ...user,
          notes,
          contacts,
          addresses,
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
    
    // Проверяем, что это клиент
    if (user.role !== UserRole.CLIENT) {
      throw new NotFoundException(`User with ID ${id} is not a client`);
    }

    // Получаем дополнительные данные из CRM entities
    const [notes, contacts, addresses, documents] = await Promise.all([
      this.noteRepository.find({
        where: { customerId: id },
        order: { createdAt: "DESC" },
      }),
      this.contactRepository.find({
        where: { customerId: id },
      }),
      this.addressRepository.find({
        where: { customerId: id },
      }),
      this.documentRepository.find({
        where: { customerId: id },
        order: { createdAt: "DESC" },
      }),
    ]);

    return {
      ...user,
      notes,
      contacts,
      addresses,
      documents,
    };
  }

  async create(dto: CreateCustomerDto, userId: string) {
    // Создаем пользователя через UsersService
    const user = await this.usersService.create({
      email: dto.email || `${dto.firstName}.${dto.lastName}@temp.masterprofi.com`,
      password: Math.random().toString(36).slice(-12), // Генерируем временный пароль
      role: UserRole.CLIENT,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    });

    // Возвращаем созданного пользователя с дополнительными данными
    return this.findOne(user.id);
  }

  async update(id: string, dto: UpdateCustomerDto) {
    // Обновляем пользователя через UsersService
    const updatedUser = await this.usersService.update(id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      email: dto.email,
    });

    // Возвращаем обновленного пользователя с дополнительными данными
    return this.findOne(updatedUser.id);
  }

  async remove(id: string) {
    const customer = await this.findOne(id);
    // Удаляем пользователя через UsersService
    await this.usersService.remove(id);
    return { success: true };
  }

  async createOrderForCustomer(customerId: string, orderData: any) {
    const customer = await this.findOne(customerId);
    
    // Используем OrdersService для создания заказа
    const order = await this.ordersService.create({
      ...orderData,
      clientId: customerId,
    });

    return {
      ...order,
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
    };
  }

  async getCustomerHistory(customerId: string) {
    const customer = await this.findOne(customerId);
    
    // Получаем заказы через OrdersService
    const allOrders = await this.ordersService.findAll();
    const customerOrders = allOrders.filter((order) => order.clientId === customerId);

    const [notes, contacts, addresses, documents] = await Promise.all([
      this.noteRepository.find({
        where: { customerId },
        order: { createdAt: "DESC" },
      }),
      this.contactRepository.find({
        where: { customerId },
      }),
      this.addressRepository.find({
        where: { customerId },
      }),
      this.documentRepository.find({
        where: { customerId },
        order: { createdAt: "DESC" },
      }),
    ]);

    return {
      customer,
      notes,
      contacts,
      addresses,
      documents,
      orders: customerOrders,
      communications: [], // TODO: Integrate with communications module
    };
  }
}

