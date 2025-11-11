import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { ScheduleSlot, SlotStatus } from "./entities/schedule-slot.entity";
import { CreateScheduleSlotDto } from "./dto/create-schedule-slot.dto";
import { BookSlotDto } from "./dto/book-slot.dto";
import { Order, OrderStatus } from "../orders/entities/order.entity";
import { NotificationGateway } from "../notification/notification.gateway";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleSlot)
    private scheduleSlotRepository: Repository<ScheduleSlot>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private notificationGateway: NotificationGateway
  ) {}

  /**
   * Создает слоты расписания для мастера
   */
  async createSlots(
    masterId: string,
    startDate: Date,
    endDate: Date,
    slotDurationMinutes: number = 60,
    workingHours: { start: string; end: string } = { start: "09:00", end: "18:00" }
  ): Promise<ScheduleSlot[]> {
    const slots: ScheduleSlot[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const [startHour, startMinute] = workingHours.start.split(":").map(Number);
      const [endHour, endMinute] = workingHours.end.split(":").map(Number);

      const dayStart = new Date(currentDate);
      dayStart.setHours(startHour, startMinute, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(endHour, endMinute, 0, 0);

      let slotStart = new Date(dayStart);

      while (slotStart < dayEnd) {
        const slotEnd = new Date(
          slotStart.getTime() + slotDurationMinutes * 60 * 1000
        );

        if (slotEnd <= dayEnd) {
          // Проверяем, не существует ли уже такой слот
          const existingSlot = await this.scheduleSlotRepository.findOne({
            where: {
              masterId,
              startTime: slotStart,
            },
          });

          if (!existingSlot) {
            const slot = this.scheduleSlotRepository.create({
              masterId,
              startTime: slotStart,
              endTime: slotEnd,
              status: SlotStatus.AVAILABLE,
            });
            slots.push(slot);
          }
        }

        slotStart = new Date(slotEnd);
      }

      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    return this.scheduleSlotRepository.save(slots);
  }

  /**
   * Получает доступные слоты для мастера в указанном диапазоне
   */
  async getAvailableSlots(
    masterId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ScheduleSlot[]> {
    return this.scheduleSlotRepository.find({
      where: {
        masterId,
        status: SlotStatus.AVAILABLE,
        startTime: Between(startDate, endDate),
      },
      order: { startTime: "ASC" },
    });
  }

  /**
   * Получает все слоты мастера (включая забронированные)
   */
  async getMasterSlots(
    masterId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ScheduleSlot[]> {
    return this.scheduleSlotRepository.find({
      where: {
        masterId,
        startTime: Between(startDate, endDate),
      },
      order: { startTime: "ASC" },
    });
  }

  /**
   * Бронирует слот для заказа
   */
  async bookSlot(bookSlotDto: BookSlotDto): Promise<ScheduleSlot> {
    const { masterId, startTime, endTime, orderId } = bookSlotDto;

    // Проверяем существование заказа
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Заказ не найден");
    }

    // Проверяем, доступен ли слот
    const slot = await this.scheduleSlotRepository.findOne({
      where: {
        masterId,
        startTime: new Date(startTime),
      },
    });

    if (!slot) {
      throw new NotFoundException("Слот не найден");
    }

    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new ConflictException("Слот уже забронирован или заблокирован");
    }

    // Проверяем, что слот подходит по времени
    const slotStart = new Date(slot.startTime);
    const slotEnd = new Date(slot.endTime);
    const requestStart = new Date(startTime);
    const requestEnd = new Date(endTime);

    if (
      requestStart < slotStart ||
      requestEnd > slotEnd ||
      requestEnd <= requestStart
    ) {
      throw new BadRequestException("Время не соответствует слоту");
    }

    // Бронируем слот
    slot.status = SlotStatus.BOOKED;
    slot.orderId = orderId;

    // Обновляем заказ
    order.scheduledAt = requestStart;
    const savedOrder = await this.ordersRepository.save(order);

    const savedSlot = await this.scheduleSlotRepository.save(slot);

    // Отправляем уведомление о бронировании
    this.notificationGateway.emitOrderBooked({
      orderId: order.id,
      masterId: masterId,
      scheduledAt: requestStart,
    });

    return savedSlot;
  }

  /**
   * Освобождает слот (при отмене заказа)
   */
  async releaseSlot(orderId: string): Promise<void> {
    const slots = await this.scheduleSlotRepository.find({
      where: { orderId },
    });

    for (const slot of slots) {
      slot.status = SlotStatus.AVAILABLE;
      slot.orderId = null;
      await this.scheduleSlotRepository.save(slot);
    }
  }

  /**
   * Блокирует слот (мастер делает его недоступным)
   */
  async blockSlot(slotId: string, masterId: string): Promise<ScheduleSlot> {
    const slot = await this.scheduleSlotRepository.findOne({
      where: { id: slotId, masterId },
    });

    if (!slot) {
      throw new NotFoundException("Слот не найден");
    }

    if (slot.status === SlotStatus.BOOKED) {
      throw new ConflictException("Нельзя заблокировать забронированный слот");
    }

    slot.status = SlotStatus.BLOCKED;
    return this.scheduleSlotRepository.save(slot);
  }

  /**
   * Разблокирует слот
   */
  async unblockSlot(slotId: string, masterId: string): Promise<ScheduleSlot> {
    const slot = await this.scheduleSlotRepository.findOne({
      where: { id: slotId, masterId },
    });

    if (!slot) {
      throw new NotFoundException("Слот не найден");
    }

    slot.status = SlotStatus.AVAILABLE;
    return this.scheduleSlotRepository.save(slot);
  }

  /**
   * Получает предстоящие заказы мастера
   */
  async getUpcomingOrders(masterId: string, limit: number = 10): Promise<Order[]> {
    const now = new Date();

    return this.ordersRepository.find({
      where: {
        masterId,
        scheduledAt: MoreThanOrEqual(now),
        status: OrderStatus.ASSIGNED,
      },
      relations: ["client"],
      order: { scheduledAt: "ASC" },
      take: limit,
    });
  }

  /**
   * Получает предстоящие заказы клиента
   */
  async getUpcomingOrdersForClient(
    clientId: string,
    limit: number = 10
  ): Promise<Order[]> {
    const now = new Date();

    return this.ordersRepository.find({
      where: {
        clientId,
        scheduledAt: MoreThanOrEqual(now),
        status: OrderStatus.ASSIGNED,
      },
      relations: ["master"],
      order: { scheduledAt: "ASC" },
      take: limit,
    });
  }

  /**
   * Проверяет предстоящие заказы и отправляет уведомления
   * Запускается по расписанию каждые 5 минут
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkUpcomingOrders() {
    const now = new Date();
    const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

    // Находим заказы, которые начнутся через 15 или 30 минут
    const upcomingOrders = await this.ordersRepository.find({
      where: [
        {
          scheduledAt: Between(now, in15Minutes),
          status: OrderStatus.ASSIGNED,
        },
        {
          scheduledAt: Between(in15Minutes, in30Minutes),
          status: OrderStatus.ASSIGNED,
        },
      ],
      relations: ["client", "master"],
    });

    for (const order of upcomingOrders) {
      if (!order.scheduledAt) continue;

      const minutesUntil = Math.floor(
        (order.scheduledAt.getTime() - now.getTime()) / (60 * 1000)
      );

      // Отправляем уведомления за 15 и 30 минут до заказа
      if (minutesUntil === 15 || minutesUntil === 30) {
        // Уведомление мастеру
        if (order.masterId) {
          this.notificationGateway.emitUpcomingOrder(
            order.masterId,
            {
              id: order.id,
              description: order.description,
              scheduledAt: order.scheduledAt,
              client: order.client,
            },
            minutesUntil
          );
        }

        // Уведомление клиенту
        if (order.clientId) {
          this.notificationGateway.emitUpcomingOrder(
            order.clientId,
            {
              id: order.id,
              description: order.description,
              scheduledAt: order.scheduledAt,
              master: order.master,
            },
            minutesUntil
          );
        }
      }
    }
  }
}

