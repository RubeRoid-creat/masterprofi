import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order, OrderStatus } from "../orders/entities/order.entity";
import { OrderStatusHistory } from "./entities/order-status-history.entity";
import { OrdersService } from "../orders/orders.service";

@Injectable()
export class CrmOrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderStatusHistory)
    private statusHistoryRepository: Repository<OrderStatusHistory>,
    private ordersService: OrdersService
  ) {}

  async findAll(userId: string, query: any) {
    const {
      page = 1,
      pageSize = 20,
      status,
      masterId,
      customerId,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = query;

    // Получаем все заказы через OrdersService
    let allOrders = await this.ordersService.findAll();

    // Применяем фильтры
    if (status) {
      allOrders = allOrders.filter((order) => order.status === status);
    }
    if (masterId) {
      allOrders = allOrders.filter((order) => order.masterId === masterId);
    }
    if (customerId) {
      allOrders = allOrders.filter((order) => order.clientId === customerId);
    }

    // Сортировка
    allOrders.sort((a, b) => {
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
    const total = allOrders.length;
    const skip = (page - 1) * pageSize;
    const data = allOrders.slice(skip, skip + pageSize);

    // Добавляем статус историю
    const dataWithHistory = await Promise.all(
      data.map(async (order) => {
        const statusHistory = await this.statusHistoryRepository.find({
          where: { orderId: order.id },
          order: { timestamp: "DESC" },
          take: 10, // Последние 10 записей
        });

        return {
          ...order,
          statusHistory,
        };
      })
    );

    return {
      data: dataWithHistory,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    // Получаем заказ через OrdersService
    const order = await this.ordersService.findOne(id);

    // Load status history separately
    const statusHistory = await this.statusHistoryRepository.find({
      where: { orderId: id },
      order: { timestamp: "DESC" },
    });

    return {
      ...order,
      statusHistory,
    };
  }

  async create(orderData: any, userId: string): Promise<Order> {
    // Используем OrdersService для создания заказа
    const order = await this.ordersService.create(orderData);

    // Create status history entry
    await this.statusHistoryRepository.save({
      orderId: order.id,
      status: order.status,
      changedBy: userId,
    });

    return order;
  }

  async updateStatus(orderId: string, status: string, userId: string) {
    // Validate status
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw new NotFoundException(`Invalid order status: ${status}`);
    }
    
    // Используем OrdersService для обновления статуса
    const order = await this.ordersService.update(
      orderId,
      { status: status as OrderStatus },
      userId
    );

    // Create status history entry
    await this.statusHistoryRepository.save({
      orderId: order.id,
      status: status,
      changedBy: userId,
    });

    return order;
  }

  async assignMaster(orderId: string, masterId: string, userId: string) {
    // Используем OrdersService для назначения мастера
    const order = await this.ordersService.update(
      orderId,
      { masterId },
      userId
    );

    // Update status if needed
    if (order.status === "created") {
      await this.updateStatus(orderId, "assigned", userId);
    }

    return order;
  }

  async getChatHistory(orderId: string) {
    // TODO: Integrate with chat module when available
    // For now, return empty array
    return {
      orderId,
      messages: [],
      message: "Chat history will be available when chat module is integrated",
    };
  }
}

