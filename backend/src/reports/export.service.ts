import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order, OrderStatus } from "../orders/entities/order.entity";
import { Payment, PaymentStatus } from "../payments/entities/payment.entity";
import { User, UserRole } from "../users/entities/user.entity";
import { MasterProfile } from "../mlm/entities/master-profile.entity";
import { Bonus } from "../mlm/entities/bonus.entity";
import * as ExcelJS from "exceljs";
import { createObjectCsvStringifier } from "csv-writer";

export enum ExportFormat {
  EXCEL = "excel",
  CSV = "csv",
  PDF = "pdf",
}

export interface ExportOptions {
  format: ExportFormat;
  startDate?: Date;
  endDate?: Date;
  entityType: "orders" | "payments" | "users" | "mlm" | "all";
  filters?: Record<string, any>;
}

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(MasterProfile)
    private masterProfileRepository: Repository<MasterProfile>,
    @InjectRepository(Bonus)
    private bonusRepository: Repository<Bonus>
  ) {}

  /**
   * Экспорт заказов в Excel
   */
  async exportOrdersToExcel(orders: Order[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Заказы");

    // Заголовки
    worksheet.columns = [
      { header: "ID", key: "id", width: 30 },
      { header: "Дата создания", key: "createdAt", width: 20 },
      { header: "Клиент", key: "client", width: 30 },
      { header: "Мастер", key: "master", width: 30 },
      { header: "Сумма", key: "totalAmount", width: 15 },
      { header: "Статус", key: "status", width: 15 },
      { header: "Адрес", key: "address", width: 40 },
      { header: "Описание", key: "description", width: 50 },
    ];

    // Стили для заголовков
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Данные
    orders.forEach((order) => {
      worksheet.addRow({
        id: order.id,
        createdAt: new Date(order.createdAt).toLocaleDateString("ru-RU"),
        client: order.client
          ? `${order.client.firstName || ""} ${order.client.lastName || ""}`.trim() || order.client.email
          : "Не указан",
        master: order.master
          ? `${order.master.firstName || ""} ${order.master.lastName || ""}`.trim() || order.master.email || "Не назначен"
          : "Не назначен",
        totalAmount: parseFloat(String(order.totalAmount || 0)),
        status: this.getStatusLabel(order.status),
        address: order.address || "",
        description: order.description || "",
      });
    });

    // Автоматическая ширина колонок
    worksheet.columns.forEach((column) => {
      if (column.width) {
        column.width = Math.max(column.width || 10, 10);
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Экспорт заказов в CSV
   */
  async exportOrdersToCSV(orders: Order[]): Promise<string> {
    const csvWriter = createObjectCsvStringifier({
      header: [
        { id: "id", title: "ID" },
        { id: "createdAt", title: "Дата создания" },
        { id: "client", title: "Клиент" },
        { id: "master", title: "Мастер" },
        { id: "totalAmount", title: "Сумма" },
        { id: "status", title: "Статус" },
        { id: "address", title: "Адрес" },
        { id: "description", title: "Описание" },
      ],
    });

    const records = orders.map((order) => ({
      id: order.id,
      createdAt: new Date(order.createdAt).toLocaleDateString("ru-RU"),
      client: order.client
        ? `${order.client.firstName || ""} ${order.client.lastName || ""}`.trim() || order.client.email
        : "Не указан",
      master: order.master
        ? `${order.master.firstName || ""} ${order.master.lastName || ""}`.trim() || order.master.email || "Не назначен"
        : "Не назначен",
      totalAmount: parseFloat(String(order.totalAmount || 0)),
      status: this.getStatusLabel(order.status),
      address: order.address || "",
      description: order.description || "",
    }));

    return csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);
  }

  /**
   * Экспорт платежей в Excel
   */
  async exportPaymentsToExcel(payments: Payment[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Платежи");

    worksheet.columns = [
      { header: "ID", key: "id", width: 30 },
      { header: "Дата", key: "createdAt", width: 20 },
      { header: "Пользователь", key: "user", width: 30 },
      { header: "Сумма", key: "amount", width: 15 },
      { header: "Статус", key: "status", width: 15 },
      { header: "Метод оплаты", key: "paymentMethod", width: 20 },
      { header: "Провайдер", key: "provider", width: 20 },
      { header: "Транзакция ID", key: "transactionId", width: 30 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    payments.forEach((payment) => {
      worksheet.addRow({
        id: payment.id,
        createdAt: new Date(payment.createdAt).toLocaleDateString("ru-RU"),
        user: payment.user
          ? `${payment.user.firstName || ""} ${payment.user.lastName || ""}`.trim() || payment.user.email
          : "Не указан",
        amount: parseFloat(String(payment.amount || 0)),
        status: this.getPaymentStatusLabel(payment.status),
        paymentMethod: payment.paymentMethod || "",
        provider: payment.provider || "",
        transactionId: payment.transactionId || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Экспорт пользователей в Excel
   */
  async exportUsersToExcel(users: User[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Пользователи");

    worksheet.columns = [
      { header: "ID", key: "id", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Телефон", key: "phone", width: 20 },
      { header: "Имя", key: "firstName", width: 20 },
      { header: "Фамилия", key: "lastName", width: 20 },
      { header: "Роль", key: "role", width: 15 },
      { header: "Активен", key: "isActive", width: 10 },
      { header: "Дата регистрации", key: "createdAt", width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    users.forEach((user) => {
      worksheet.addRow({
        id: user.id,
        email: user.email,
        phone: user.phone || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: this.getRoleLabel(user.role),
        isActive: user.isActive ? "Да" : "Нет",
        createdAt: new Date(user.createdAt).toLocaleDateString("ru-RU"),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Массовый экспорт всех данных
   */
  async exportAllData(options: ExportOptions): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Экспорт заказов
    if (options.entityType === "orders" || options.entityType === "all") {
      const orders = await this.getOrders(options);
      if (orders.length > 0) {
        const ordersSheet = workbook.addWorksheet("Заказы");
        this.addOrdersToSheet(ordersSheet, orders);
      }
    }

    // Экспорт платежей
    if (options.entityType === "payments" || options.entityType === "all") {
      const payments = await this.getPayments(options);
      if (payments.length > 0) {
        const paymentsSheet = workbook.addWorksheet("Платежи");
        this.addPaymentsToSheet(paymentsSheet, payments);
      }
    }

    // Экспорт пользователей
    if (options.entityType === "users" || options.entityType === "all") {
      const users = await this.getUsers(options);
      if (users.length > 0) {
        const usersSheet = workbook.addWorksheet("Пользователи");
        this.addUsersToSheet(usersSheet, users);
      }
    }

    // Экспорт MLM данных
    if (options.entityType === "mlm" || options.entityType === "all") {
      const mlmData = await this.getMlmData(options);
      if (mlmData.masters.length > 0) {
        const mlmSheet = workbook.addWorksheet("MLM Статистика");
        this.addMlmDataToSheet(mlmSheet, mlmData);
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async getOrders(options: ExportOptions): Promise<Order[]> {
    let queryBuilder = this.ordersRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.client", "client")
      .leftJoinAndSelect("order.master", "master");

    if (options.startDate) {
      queryBuilder.andWhere("order.createdAt >= :startDate", {
        startDate: options.startDate,
      });
    }
    if (options.endDate) {
      queryBuilder.andWhere("order.createdAt <= :endDate", {
        endDate: options.endDate,
      });
    }
    if (options.filters?.status) {
      queryBuilder.andWhere("order.status = :status", {
        status: options.filters.status,
      });
    }

    return queryBuilder.orderBy("order.createdAt", "DESC").getMany();
  }

  private async getPayments(options: ExportOptions): Promise<Payment[]> {
    let queryBuilder = this.paymentsRepository
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.user", "user");

    if (options.startDate) {
      queryBuilder.andWhere("payment.createdAt >= :startDate", {
        startDate: options.startDate,
      });
    }
    if (options.endDate) {
      queryBuilder.andWhere("payment.createdAt <= :endDate", {
        endDate: options.endDate,
      });
    }
    if (options.filters?.status) {
      queryBuilder.andWhere("payment.status = :status", {
        status: options.filters.status,
      });
    }

    return queryBuilder.orderBy("payment.createdAt", "DESC").getMany();
  }

  private async getUsers(options: ExportOptions): Promise<User[]> {
    let queryBuilder = this.usersRepository.createQueryBuilder("user");

    if (options.filters?.role) {
      queryBuilder.andWhere("user.role = :role", { role: options.filters.role });
    }

    return queryBuilder.orderBy("user.createdAt", "DESC").getMany();
  }

  private async getMlmData(options: ExportOptions): Promise<{
    masters: MasterProfile[];
    bonuses: Bonus[];
  }> {
    const masters = await this.masterProfileRepository
      .createQueryBuilder("profile")
      .leftJoinAndSelect("profile.user", "user")
      .getMany();

    let bonusesQuery = this.bonusRepository
      .createQueryBuilder("bonus")
      .leftJoinAndSelect("bonus.user", "user");

    if (options.startDate) {
      bonusesQuery.andWhere("bonus.createdAt >= :startDate", {
        startDate: options.startDate,
      });
    }
    if (options.endDate) {
      bonusesQuery.andWhere("bonus.createdAt <= :endDate", {
        endDate: options.endDate,
      });
    }

    const bonuses = await bonusesQuery.orderBy("bonus.createdAt", "DESC").getMany();

    return { masters, bonuses };
  }

  private addOrdersToSheet(worksheet: ExcelJS.Worksheet, orders: Order[]): void {
    worksheet.columns = [
      { header: "ID", key: "id", width: 30 },
      { header: "Дата", key: "createdAt", width: 20 },
      { header: "Клиент", key: "client", width: 30 },
      { header: "Мастер", key: "master", width: 30 },
      { header: "Сумма", key: "totalAmount", width: 15 },
      { header: "Статус", key: "status", width: 15 },
      { header: "Адрес", key: "address", width: 40 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    orders.forEach((order) => {
      worksheet.addRow({
        id: order.id,
        createdAt: new Date(order.createdAt).toLocaleDateString("ru-RU"),
        client: order.client
          ? `${order.client.firstName || ""} ${order.client.lastName || ""}`.trim() || order.client.email
          : "Не указан",
        master: order.master
          ? `${order.master.firstName || ""} ${order.master.lastName || ""}`.trim() || order.master.email || "Не назначен"
          : "Не назначен",
        totalAmount: parseFloat(String(order.totalAmount || 0)),
        status: this.getStatusLabel(order.status),
        address: order.address || "",
      });
    });
  }

  private addPaymentsToSheet(worksheet: ExcelJS.Worksheet, payments: Payment[]): void {
    worksheet.columns = [
      { header: "ID", key: "id", width: 30 },
      { header: "Дата", key: "createdAt", width: 20 },
      { header: "Пользователь", key: "user", width: 30 },
      { header: "Сумма", key: "amount", width: 15 },
      { header: "Статус", key: "status", width: 15 },
      { header: "Провайдер", key: "provider", width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    payments.forEach((payment) => {
      worksheet.addRow({
        id: payment.id,
        createdAt: new Date(payment.createdAt).toLocaleDateString("ru-RU"),
        user: payment.user
          ? `${payment.user.firstName || ""} ${payment.user.lastName || ""}`.trim() || payment.user.email
          : "Не указан",
        amount: parseFloat(String(payment.amount || 0)),
        status: this.getPaymentStatusLabel(payment.status),
        provider: payment.provider || "",
      });
    });
  }

  private addUsersToSheet(worksheet: ExcelJS.Worksheet, users: User[]): void {
    worksheet.columns = [
      { header: "ID", key: "id", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Телефон", key: "phone", width: 20 },
      { header: "Имя", key: "firstName", width: 20 },
      { header: "Фамилия", key: "lastName", width: 20 },
      { header: "Роль", key: "role", width: 15 },
      { header: "Активен", key: "isActive", width: 10 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    users.forEach((user) => {
      worksheet.addRow({
        id: user.id,
        email: user.email,
        phone: user.phone || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: this.getRoleLabel(user.role),
        isActive: user.isActive ? "Да" : "Нет",
      });
    });
  }

  private addMlmDataToSheet(
    worksheet: ExcelJS.Worksheet,
    data: { masters: MasterProfile[]; bonuses: Bonus[] }
  ): void {
    worksheet.columns = [
      { header: "Мастер", key: "master", width: 30 },
      { header: "Рефералов", key: "referralsCount", width: 15 },
      { header: "Всего заработано", key: "totalEarnings", width: 20 },
      { header: "Доступный баланс", key: "availableBalance", width: 20 },
      { header: "Выведено", key: "withdrawnAmount", width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    data.masters.forEach((profile) => {
      const userName = profile.user
        ? `${profile.user.firstName || ""} ${profile.user.lastName || ""}`.trim() || profile.user.email
        : "Неизвестно";

      worksheet.addRow({
        master: userName,
        referralsCount: profile.referralsCount || 0,
        totalEarnings: parseFloat(String(profile.totalEarnings || 0)),
        availableBalance: parseFloat(String(profile.availableBalance || 0)),
        withdrawnAmount: parseFloat(String(profile.withdrawnAmount || 0)),
      });
    });
  }

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

  private getPaymentStatusLabel(status: PaymentStatus | string): string {
    const labels: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]: "Ожидает",
      [PaymentStatus.PROCESSING]: "Обрабатывается",
      [PaymentStatus.COMPLETED]: "Завершен",
      [PaymentStatus.FAILED]: "Ошибка",
      [PaymentStatus.REFUNDED]: "Возвращен",
    };
    // status stored as string in DB; map to enum if matches
    const normalized = (status as string) as PaymentStatus;
    return labels[normalized] || (status as string);
  }

  private getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.CLIENT]: "Клиент",
      [UserRole.MASTER]: "Мастер",
      [UserRole.ADMIN]: "Администратор",
    };
    return labels[role] || role;
  }
}

