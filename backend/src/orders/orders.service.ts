import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { NotificationGateway } from "../notification/notification.gateway";
import { OrderHistoryService } from "./order-history.service";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private notificationGateway: NotificationGateway,
    private orderHistoryService: OrderHistoryService
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Преобразуем строковый status в enum если передан
    const orderData: Partial<Order> = {
      ...createOrderDto,
      status: createOrderDto.status
        ? (createOrderDto.status as OrderStatus)
        : OrderStatus.CREATED,
      scheduledAt: createOrderDto.scheduledAt
        ? new Date(createOrderDto.scheduledAt)
        : undefined,
    };
    const order = this.ordersRepository.create(orderData);
    const saved = await this.ordersRepository.save(order);

    // Логируем создание заказа
    await this.orderHistoryService.logOrderCreated(saved, saved.clientId);

    // Отправляем уведомление о создании заказа
    this.notificationGateway.emitOrderCreated({
      id: saved.id,
      totalAmount: saved.totalAmount,
      status: saved.status,
      clientId: saved.clientId,
      createdAt: saved.createdAt,
    });

    // Преобразуем decimal поля в числа
    return {
      ...saved,
      totalAmount: parseFloat(String(saved.totalAmount)) || 0,
    } as Order;
  }

  async findAll(): Promise<Order[]> {
    try {
      // Сначала загружаем заказы без relations, чтобы избежать ошибок UUID
      const orders = await this.ordersRepository
        .createQueryBuilder("order")
        .where("order.clientId IS NOT NULL")
        .andWhere("order.clientId != ''")
        .getMany();

      // Затем загружаем relations для каждого заказа отдельно
      const ordersWithRelations = await Promise.all(
        orders.map(async (order) => {
          try {
            // Загружаем client только если clientId валидный
            let client = null;
            if (order.clientId && this.isValidUUID(order.clientId)) {
              try {
                client = await this.ordersRepository.manager.findOne("User", {
                  where: { id: order.clientId },
                });
              } catch (err) {
                console.warn(`Failed to load client for order ${order.id}:`, err);
              }
            }

            // Загружаем master только если masterId валидный
            let master = null;
            if (order.masterId && this.isValidUUID(order.masterId)) {
              try {
                master = await this.ordersRepository.manager.findOne("User", {
                  where: { id: order.masterId },
                });
              } catch (err) {
                console.warn(`Failed to load master for order ${order.id}:`, err);
              }
            }

            return {
              ...order,
              totalAmount: parseFloat(String(order.totalAmount)) || 0,
              client,
              master,
            };
          } catch (err) {
            console.error(`Error loading relations for order ${order.id}:`, err);
            return {
              ...order,
              totalAmount: parseFloat(String(order.totalAmount)) || 0,
              client: null,
              master: null,
            };
          }
        })
      );

      return ordersWithRelations as Order[];
    } catch (error: any) {
      console.error("Error in orders.findAll:", error);
      
      // Если ошибка связана с UUID или relations, пробуем загрузить без relations
      if (
        error.message?.includes("relation") ||
        error.message?.includes("join") ||
        error.message?.includes("uuid") ||
        error.message?.includes("syntax")
      ) {
        console.warn("Attempting to load orders without relations due to error:", error.message);
        try {
          const orders = await this.ordersRepository
            .createQueryBuilder("order")
            .where("order.clientId IS NOT NULL")
            .andWhere("order.clientId != ''")
            .getMany();
          
          return orders.map((order) => ({
            ...order,
            totalAmount: parseFloat(String(order.totalAmount)) || 0,
            client: null,
            master: null,
          })) as Order[];
        } catch (fallbackError: any) {
          console.error("Error loading orders without relations:", fallbackError);
          // В крайнем случае возвращаем пустой массив
          return [];
        }
      }
      throw error;
    }
  }

  /**
   * Проверка, является ли строка валидным UUID
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  async findOne(id: string): Promise<Order> {
    // Проверяем, что id не пустой и валидный
    if (!id || id.trim() === "") {
      throw new NotFoundException(`Order ID cannot be empty`);
    }

    if (!this.isValidUUID(id)) {
      throw new NotFoundException(`Invalid order ID format: ${id}`);
    }

    try {
      // Загружаем заказ без relations сначала
      const order = await this.ordersRepository.findOne({
        where: { id },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Загружаем relations отдельно, если они валидные
      let client = null;
      if (order.clientId && this.isValidUUID(order.clientId)) {
        try {
          client = await this.ordersRepository.manager.findOne("User", {
            where: { id: order.clientId },
          });
        } catch (err) {
          console.warn(`Failed to load client for order ${order.id}:`, err);
        }
      }

      let master = null;
      if (order.masterId && this.isValidUUID(order.masterId)) {
        try {
          master = await this.ordersRepository.manager.findOne("User", {
            where: { id: order.masterId },
          });
        } catch (err) {
          console.warn(`Failed to load master for order ${order.id}:`, err);
        }
      }

      // Преобразуем decimal поля в числа
      return {
        ...order,
        totalAmount: parseFloat(String(order.totalAmount)) || 0,
        client,
        master,
      } as Order;
    } catch (error: any) {
      // Если ошибка связана с UUID, пробуем без relations
      if (error.message?.includes("uuid") || error.message?.includes("syntax")) {
        const order = await this.ordersRepository.findOne({
          where: { id },
        });

        if (!order) {
          throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return {
          ...order,
          totalAmount: parseFloat(String(order.totalAmount)) || 0,
          client: null,
          master: null,
        } as Order;
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId?: string
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Сохраняем старые значения для логирования
    const oldStatus = order.status;
    const oldMasterId = order.masterId;
    const oldAmount = parseFloat(String(order.totalAmount));
    const oldDescription = order.description;

    // Преобразуем строковый status в enum если передан
    const updateData: Partial<Order> = {
      ...updateOrderDto,
      scheduledAt: updateOrderDto.scheduledAt
        ? new Date(updateOrderDto.scheduledAt)
        : undefined,
      status: updateOrderDto.status
        ? (updateOrderDto.status as OrderStatus)
        : undefined,
    };

    Object.assign(order, updateData);
    const saved = await this.ordersRepository.save(order);

    // Логируем изменения
    const newAmount = parseFloat(String(saved.totalAmount));
    const newMasterId = saved.masterId;
    const newDescription = saved.description;

    // Логирование изменения статуса
    if (updateOrderDto.status && oldStatus !== saved.status) {
      await this.orderHistoryService.logStatusChange(
        saved.id,
        oldStatus,
        saved.status,
        userId
      );
    }

    // Логирование изменения мастера
    if (updateOrderDto.masterId !== undefined && oldMasterId !== newMasterId) {
      await this.orderHistoryService.logMasterAssignment(
        saved.id,
        oldMasterId,
        newMasterId,
        userId
      );
    }

    // Логирование изменения суммы
    if (
      updateOrderDto.totalAmount !== undefined &&
      oldAmount !== newAmount
    ) {
      await this.orderHistoryService.logAmountChange(
        saved.id,
        oldAmount,
        newAmount,
        userId
      );
    }

    // Логирование изменения описания
    if (
      updateOrderDto.description !== undefined &&
      oldDescription !== newDescription
    ) {
      await this.orderHistoryService.logDescriptionChange(
        saved.id,
        oldDescription,
        newDescription,
        userId
      );
    }

    // Отправляем уведомление об изменении статуса с полным объектом заказа
    if (updateOrderDto.status && oldStatus !== saved.status) {
      const orderData = {
        id: saved.id,
        totalAmount: parseFloat(String(saved.totalAmount)) || 0,
        status: saved.status,
        clientId: saved.clientId,
        masterId: saved.masterId,
        description: saved.description,
        address: saved.address,
        latitude: saved.latitude ? parseFloat(String(saved.latitude)) : null,
        longitude: saved.longitude ? parseFloat(String(saved.longitude)) : null,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      };
      this.notificationGateway.emitOrderStatusChanged(saved.id, saved.status, orderData);
    }

    // Преобразуем decimal поля в числа
    return {
      ...saved,
      totalAmount: parseFloat(String(saved.totalAmount)) || 0,
    } as Order;
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }
}
