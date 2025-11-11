import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderHistory, OrderHistoryAction } from "./entities/order-history.entity";
import { Order, OrderStatus } from "./entities/order.entity";

@Injectable()
export class OrderHistoryService {
  constructor(
    @InjectRepository(OrderHistory)
    private historyRepository: Repository<OrderHistory>
  ) {}

  /**
   * Логирование создания заказа
   */
  async logOrderCreated(order: Order, userId?: string): Promise<OrderHistory> {
    return this.historyRepository.save({
      orderId: order.id,
      action: OrderHistoryAction.CREATED,
      description: `Заказ создан. Статус: ${order.status}`,
      userId: userId || null, // Используем userId вместо changedByUserId
    });
  }

  /**
   * Логирование изменения статуса
   */
  async logStatusChange(
    orderId: string,
    oldStatus: OrderStatus,
    newStatus: OrderStatus,
    userId?: string
  ): Promise<OrderHistory> {
    return this.historyRepository.save({
      orderId,
      action: OrderHistoryAction.STATUS_CHANGED,
      oldValue: String(oldStatus || ""),
      newValue: String(newStatus || ""),
      description: `Статус изменен с "${this.getStatusLabel(oldStatus)}" на "${this.getStatusLabel(newStatus)}"`,
      userId: userId || null,
    });
  }

  /**
   * Логирование назначения/изменения мастера
   */
  async logMasterAssignment(
    orderId: string,
    oldMasterId: string | null,
    newMasterId: string | null,
    userId?: string
  ): Promise<OrderHistory> {
    const action = oldMasterId ? OrderHistoryAction.MASTER_CHANGED : OrderHistoryAction.MASTER_ASSIGNED;
    const description = oldMasterId
      ? `Мастер изменен с ID ${oldMasterId?.substring(0, 8) || "не назначен"} на ${newMasterId?.substring(0, 8) || "не назначен"}`
      : `Мастер назначен: ${newMasterId?.substring(0, 8) || "не указан"}`;

    return this.historyRepository.save({
      orderId,
      action,
      oldValue: oldMasterId || "",
      newValue: newMasterId || "",
      description,
      userId: userId || null,
    });
  }

  /**
   * Логирование изменения суммы
   */
  async logAmountChange(
    orderId: string,
    oldAmount: number,
    newAmount: number,
    userId?: string
  ): Promise<OrderHistory> {
    return this.historyRepository.save({
      orderId,
      action: OrderHistoryAction.AMOUNT_CHANGED,
      oldValue: String(oldAmount || ""),
      newValue: String(newAmount || ""),
      description: `Сумма изменена с ${oldAmount} ₽ на ${newAmount} ₽`,
      userId: userId || null,
    });
  }

  /**
   * Логирование изменения описания
   */
  async logDescriptionChange(
    orderId: string,
    oldDescription: string | null,
    newDescription: string | null,
    userId?: string
  ): Promise<OrderHistory> {
    return this.historyRepository.save({
      orderId,
      action: OrderHistoryAction.DESCRIPTION_CHANGED,
      oldValue: oldDescription || "",
      newValue: newDescription || "",
      description: "Описание заказа изменено",
      userId: userId || null,
    });
  }

  /**
   * Логирование общего обновления
   */
  async logUpdate(
    orderId: string,
    changes: Record<string, { old: any; new: any }>,
    userId?: string
  ): Promise<OrderHistory[]> {
    const historyItems: OrderHistory[] = [];

    for (const [field, values] of Object.entries(changes)) {
      const action = this.getActionForField(field);
      historyItems.push(
        this.historyRepository.create({
          orderId,
          action,
          oldValue: String(values.old || ""),
          newValue: String(values.new || ""),
          description: `Поле "${field}" обновлено`,
          userId: userId || null,
        })
      );
    }

    return this.historyRepository.save(historyItems);
  }

  /**
   * Получить всю историю заказа
   */
  async getOrderHistory(orderId: string): Promise<OrderHistory[]> {
    try {
      // Проверяем валидность orderId
      if (!orderId || orderId.trim() === "") {
        return [];
      }

      // Загружаем без relations сначала, чтобы избежать ошибок UUID
      const history = await this.historyRepository.find({
        where: { orderId },
        order: { createdAt: "ASC" },
      });

      // Возвращаем без relations, чтобы избежать ошибок UUID
      return history.map((item) => ({
        ...item,
        changedBy: null,
        order: null,
      }));
    } catch (error: any) {
      console.error("Error loading order history:", error);
      if (error.message?.includes("uuid") || error.message?.includes("syntax")) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Получить историю изменений статусов
   */
  async getStatusHistory(orderId: string): Promise<OrderHistory[]> {
    try {
      if (!orderId || orderId.trim() === "") {
        return [];
      }

      return await this.historyRepository.find({
        where: {
          orderId,
          action: OrderHistoryAction.STATUS_CHANGED,
        },
        order: { createdAt: "ASC" },
      });
    } catch (error: any) {
      console.error("Error loading status history:", error);
      if (error.message?.includes("uuid") || error.message?.includes("syntax")) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Получить историю назначений мастеров
   */
  async getMasterHistory(orderId: string): Promise<OrderHistory[]> {
    try {
      if (!orderId || orderId.trim() === "") {
        return [];
      }

      return await this.historyRepository.find({
        where: [
          { orderId, action: OrderHistoryAction.MASTER_ASSIGNED },
          { orderId, action: OrderHistoryAction.MASTER_CHANGED },
        ],
        order: { createdAt: "ASC" },
      });
    } catch (error: any) {
      console.error("Error loading master history:", error);
      if (error.message?.includes("uuid") || error.message?.includes("syntax")) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Получить последнее изменение
   */
  async getLatestChange(orderId: string): Promise<OrderHistory | null> {
    try {
      if (!orderId || orderId.trim() === "") {
        return null;
      }

      return await this.historyRepository.findOne({
        where: { orderId },
        order: { createdAt: "DESC" },
      });
    } catch (error: any) {
      console.error("Error loading latest change:", error);
      if (error.message?.includes("uuid") || error.message?.includes("syntax")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Вспомогательные методы
   */
  private getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.CREATED]: "Создан",
      [OrderStatus.ASSIGNED]: "Назначен",
      [OrderStatus.IN_PROGRESS]: "В работе",
      [OrderStatus.COMPLETED]: "Завершен",
      [OrderStatus.CANCELLED]: "Отменен",
    };
    return labels[status] || status;
  }

  private getActionForField(field: string): OrderHistoryAction {
    const fieldActions: Record<string, OrderHistoryAction> = {
      status: OrderHistoryAction.STATUS_CHANGED,
      masterId: OrderHistoryAction.MASTER_ASSIGNED,
      totalAmount: OrderHistoryAction.AMOUNT_CHANGED,
      description: OrderHistoryAction.DESCRIPTION_CHANGED,
    };
    return fieldActions[field] || OrderHistoryAction.UPDATED;
  }
}

