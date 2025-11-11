import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order, OrderStatus } from "../orders/entities/order.entity";
import { Payment, PaymentStatus } from "../payments/entities/payment.entity";
import { MasterProfile } from "../mlm/entities/master-profile.entity";
import { Bonus, BonusStatus } from "../mlm/entities/bonus.entity";
import { User } from "../users/entities/user.entity";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteer = require("puppeteer");

export interface OrdersReportFilters {
  startDate?: Date;
  endDate?: Date;
  status?: OrderStatus;
  clientId?: string;
  masterId?: string;
}

export interface MLMReportFilters {
  startDate?: Date;
  endDate?: Date;
  masterId?: string;
}

export interface FinancialReportFilters {
  startDate?: Date;
  endDate?: Date;
  paymentStatus?: PaymentStatus;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(MasterProfile)
    private masterProfileRepository: Repository<MasterProfile>,
    @InjectRepository(Bonus)
    private bonusRepository: Repository<Bonus>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  /**
   * Генерация HTML для отчета по заказам
   */
  private generateOrdersReportHTML(orders: Order[], filters: OrdersReportFilters, stats: any): string {
    const totalOrders = stats.totalOrders;
    const totalAmount = stats.totalAmount;
    const statusCounts = stats.statusCounts;

    const ordersHTML = orders
      .map((order) => {
        const clientName = order.client
          ? order.client.firstName && order.client.lastName
            ? `${order.client.firstName} ${order.client.lastName}`
            : order.client.email
          : "Не указан";

        const masterName = order.master
          ? order.master.firstName && order.master.lastName
            ? `${order.master.firstName} ${order.master.lastName}`
            : order.master.email || "Не назначен"
          : "Не назначен";

        return `
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #2563eb;">Заказ #${order.id.substring(0, 8)}</h3>
            <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleDateString("ru-RU")}</p>
            <p><strong>Статус:</strong> ${this.getStatusLabel(order.status)}</p>
            <p><strong>Сумма:</strong> ${parseFloat(String(order.totalAmount || 0)).toFixed(2)} ₽</p>
            <p><strong>Клиент:</strong> ${clientName}</p>
            <p><strong>Мастер:</strong> ${masterName}</p>
            ${order.description ? `<p><strong>Описание:</strong> ${order.description.substring(0, 200)}${order.description.length > 200 ? "..." : ""}</p>` : ""}
          </div>
        `;
      })
      .join("");

    const statusCountsHTML = Object.entries(statusCounts)
      .map(([status, count]) => `<li>${this.getStatusLabel(status as OrderStatus)}: ${count}</li>`)
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Отчет по заказам</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .subtitle {
            text-align: center;
            color: #6b7280;
            margin-bottom: 30px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
          }
          ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          li {
            margin: 5px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-box {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #3b82f6;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
          }
          .stat-label {
            font-size: 14px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <h1>Отчет по заказам</h1>
        ${
          filters.startDate || filters.endDate
            ? `<p class="subtitle">Период: ${filters.startDate ? filters.startDate.toLocaleDateString("ru-RU") : "не указано"} - ${filters.endDate ? filters.endDate.toLocaleDateString("ru-RU") : "не указано"}</p>`
            : ""
        }
        
        <div class="section">
          <div class="section-title">Статистика</div>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">${totalOrders}</div>
              <div class="stat-label">Всего заказов</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${totalAmount.toFixed(2)} ₽</div>
              <div class="stat-label">Общая сумма</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">По статусам</div>
          <ul>${statusCountsHTML}</ul>
        </div>

        <div class="section">
          <div class="section-title">Детали заказов</div>
          ${ordersHTML}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Генерация HTML для MLM отчета
   */
  private generateMLMReportHTML(
    bonuses: Bonus[],
    masterProfiles: MasterProfile[],
    filters: MLMReportFilters,
    stats: any
  ): string {
    const totalBonuses = stats.totalBonuses;
    const totalAmount = stats.totalAmount;
    const pendingAmount = stats.pendingAmount;
    const paidAmount = stats.paidAmount;

    const mastersHTML = masterProfiles
      .map((profile) => {
        const userName =
          profile.user?.firstName && profile.user?.lastName
            ? `${profile.user.firstName} ${profile.user.lastName}`
            : profile.user?.email || "Неизвестно";

        return `
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #7c3aed;">${userName}</h3>
            <p><strong>Всего комиссий:</strong> ${parseFloat(String(profile.totalCommissions || 0)).toFixed(2)} ₽</p>
            <p><strong>Доступный баланс:</strong> ${parseFloat(String(profile.availableBalance || 0)).toFixed(2)} ₽</p>
            <p><strong>Выведено:</strong> ${parseFloat(String(profile.withdrawnAmount || 0)).toFixed(2)} ₽</p>
          </div>
        `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Отчет по MLM</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .subtitle {
            text-align: center;
            color: #6b7280;
            margin-bottom: 30px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 5px;
          }
          ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          li {
            margin: 5px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-box {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #7c3aed;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
          }
          .stat-label {
            font-size: 14px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <h1>Отчет по MLM</h1>
        ${
          filters.startDate || filters.endDate
            ? `<p class="subtitle">Период: ${filters.startDate ? filters.startDate.toLocaleDateString("ru-RU") : "не указано"} - ${filters.endDate ? filters.endDate.toLocaleDateString("ru-RU") : "не указано"}</p>`
            : ""
        }
        
        <div class="section">
          <div class="section-title">Общая статистика</div>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">${totalBonuses}</div>
              <div class="stat-label">Всего бонусов</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${totalAmount.toFixed(2)} ₽</div>
              <div class="stat-label">Общая сумма</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${pendingAmount.toFixed(2)} ₽</div>
              <div class="stat-label">Ожидает выплаты</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${paidAmount.toFixed(2)} ₽</div>
              <div class="stat-label">Выплачено</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Статистика по мастерам</div>
          ${mastersHTML}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Генерация HTML для финансового отчета
   */
  private generateFinancialReportHTML(
    payments: Payment[],
    filters: FinancialReportFilters,
    stats: any
  ): string {
    const totalPayments = stats.totalPayments;
    const totalAmount = stats.totalAmount;
    const completedAmount = stats.completedAmount;
    const pendingAmount = stats.pendingAmount;
    const statusCounts = stats.statusCounts;

    const paymentsHTML = payments
      .map((payment) => {
        const userName = payment.user
          ? payment.user.firstName && payment.user.lastName
            ? `${payment.user.firstName} ${payment.user.lastName}`
            : payment.user.email
          : "Не указан";

        return `
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #059669;">Платеж #${payment.id.substring(0, 8)}</h3>
            <p><strong>Дата:</strong> ${new Date(payment.createdAt).toLocaleDateString("ru-RU")}</p>
            <p><strong>Статус:</strong> ${this.getPaymentStatusLabel(payment.status)}</p>
            <p><strong>Сумма:</strong> ${parseFloat(String(payment.amount || 0)).toFixed(2)} ₽</p>
            <p><strong>Пользователь:</strong> ${userName}</p>
          </div>
        `;
      })
      .join("");

    const statusCountsHTML = Object.entries(statusCounts)
      .map(([status, count]) => `<li>${this.getPaymentStatusLabel(status as PaymentStatus)}: ${count}</li>`)
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Финансовый отчет</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .subtitle {
            text-align: center;
            color: #6b7280;
            margin-bottom: 30px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 2px solid #059669;
            padding-bottom: 5px;
          }
          ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          li {
            margin: 5px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-box {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #059669;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
          }
          .stat-label {
            font-size: 14px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <h1>Финансовый отчет</h1>
        ${
          filters.startDate || filters.endDate
            ? `<p class="subtitle">Период: ${filters.startDate ? filters.startDate.toLocaleDateString("ru-RU") : "не указано"} - ${filters.endDate ? filters.endDate.toLocaleDateString("ru-RU") : "не указано"}</p>`
            : ""
        }
        
        <div class="section">
          <div class="section-title">Общая статистика</div>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">${totalPayments}</div>
              <div class="stat-label">Всего платежей</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${totalAmount.toFixed(2)} ₽</div>
              <div class="stat-label">Общая сумма</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${completedAmount.toFixed(2)} ₽</div>
              <div class="stat-label">Завершено</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${pendingAmount.toFixed(2)} ₽</div>
              <div class="stat-label">Ожидает</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">По статусам</div>
          <ul>${statusCountsHTML}</ul>
        </div>

        <div class="section">
          <div class="section-title">Детали платежей</div>
          ${paymentsHTML}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Генерация PDF из HTML через Puppeteer
   */
  private async generatePDFFromHTML(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
          top: "20mm",
          right: "15mm",
          bottom: "20mm",
          left: "15mm",
        },
        printBackground: true,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Генерация отчета по заказам
   */
  async generateOrdersReport(filters: OrdersReportFilters): Promise<Buffer> {
    // Получение данных
    const queryBuilder = this.ordersRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.client", "client")
      .leftJoinAndSelect("order.master", "master");

    if (filters.startDate) {
      queryBuilder.andWhere("order.createdAt >= :startDate", {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      queryBuilder.andWhere("order.createdAt <= :endDate", {
        endDate: filters.endDate,
      });
    }
    if (filters.status) {
      queryBuilder.andWhere("order.status = :status", { status: filters.status });
    }
    if (filters.clientId) {
      queryBuilder.andWhere("order.clientId = :clientId", {
        clientId: filters.clientId,
      });
    }
    if (filters.masterId) {
      queryBuilder.andWhere("order.masterId = :masterId", {
        masterId: filters.masterId,
      });
    }

    const orders = await queryBuilder.orderBy("order.createdAt", "DESC").getMany();

    // Статистика
    const totalOrders = orders.length;
    const totalAmount = orders.reduce(
      (sum, order) => sum + parseFloat(String(order.totalAmount || 0)),
      0
    );
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);

    const html = this.generateOrdersReportHTML(orders, filters, {
      totalOrders,
      totalAmount,
      statusCounts,
    });

    return this.generatePDFFromHTML(html);
  }

  /**
   * Генерация отчета по MLM
   */
  async generateMLMReport(filters: MLMReportFilters): Promise<Buffer> {
    // Получение данных
    let queryBuilder = this.bonusRepository
      .createQueryBuilder("bonus")
      .leftJoinAndSelect("bonus.user", "user");

    if (filters.startDate) {
      queryBuilder.andWhere("bonus.createdAt >= :startDate", {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      queryBuilder.andWhere("bonus.createdAt <= :endDate", {
        endDate: filters.endDate,
      });
    }
    if (filters.masterId) {
      queryBuilder.andWhere("bonus.userId = :masterId", {
        masterId: filters.masterId,
      });
    }

    const bonuses = await queryBuilder.orderBy("bonus.createdAt", "DESC").getMany();

    // Статистика
    const totalBonuses = bonuses.length;
    const totalAmount = bonuses.reduce(
      (sum, bonus) => sum + parseFloat(String(bonus.amount || 0)),
      0
    );
    const pendingAmount = bonuses
      .filter((b) => b.status === BonusStatus.PENDING)
      .reduce((sum, bonus) => sum + parseFloat(String(bonus.amount || 0)), 0);
    const paidAmount = bonuses
      .filter((b) => b.status === BonusStatus.PAID)
      .reduce((sum, bonus) => sum + parseFloat(String(bonus.amount || 0)), 0);

    // Получение статистики по мастерам
    let masterStatsQuery = this.masterProfileRepository
      .createQueryBuilder("profile")
      .leftJoinAndSelect("profile.user", "user");

    if (filters.masterId) {
      masterStatsQuery.andWhere("profile.userId = :masterId", {
        masterId: filters.masterId,
      });
    }

    const masterProfiles = await masterStatsQuery.getMany();

    const html = this.generateMLMReportHTML(bonuses, masterProfiles, filters, {
      totalBonuses,
      totalAmount,
      pendingAmount,
      paidAmount,
    });

    return this.generatePDFFromHTML(html);
  }

  /**
   * Генерация финансового отчета
   */
  async generateFinancialReport(filters: FinancialReportFilters): Promise<Buffer> {
    // Получение платежей
    let queryBuilder = this.paymentsRepository
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.user", "user");

    if (filters.startDate) {
      queryBuilder.andWhere("payment.createdAt >= :startDate", {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      queryBuilder.andWhere("payment.createdAt <= :endDate", {
        endDate: filters.endDate,
      });
    }
    if (filters.paymentStatus) {
      queryBuilder.andWhere("payment.status = :status", {
        status: filters.paymentStatus,
      });
    }

    const payments = await queryBuilder.orderBy("payment.createdAt", "DESC").getMany();

    // Статистика
    const totalPayments = payments.length;
    const totalAmount = payments.reduce(
      (sum, payment) => sum + parseFloat(String(payment.amount || 0)),
      0
    );
    const completedAmount = payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, payment) => sum + parseFloat(String(payment.amount || 0)), 0);
    const pendingAmount = payments
      .filter((p) => p.status === PaymentStatus.PENDING)
      .reduce((sum, payment) => sum + parseFloat(String(payment.amount || 0)), 0);

    const statusCounts = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {} as Record<PaymentStatus, number>);

    const html = this.generateFinancialReportHTML(payments, filters, {
      totalPayments,
      totalAmount,
      completedAmount,
      pendingAmount,
      statusCounts,
    });

    return this.generatePDFFromHTML(html);
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
    const normalized = (status as string) as PaymentStatus;
    return labels[normalized] || (status as string);
  }

  // Payment type is not stored; omit type labeling
}
