import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Transaction } from "./entities/transaction.entity";
import { PayoutRequest } from "./entities/payout-request.entity";
import { Invoice } from "./entities/invoice.entity";
import { PaymentsService } from "../payments/payments.service";
import { OrdersService } from "../orders/orders.service";

@Injectable()
export class CrmFinanceService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(PayoutRequest)
    private payoutRepository: Repository<PayoutRequest>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private paymentsService: PaymentsService,
    private ordersService: OrdersService
  ) {}

  async getOverview(userId: string, query: any) {
    const { startDate, endDate } = query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Получаем платежи через PaymentsService
    const allPayments = await this.paymentsService.findAll();
    
    // Фильтруем по дате и статусу
    const periodPayments = allPayments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= start && paymentDate <= end && payment.status === "completed";
    });

    // Рассчитываем доходы (успешные платежи)
    const revenue = periodPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    // Получаем расходы из Transaction entity (можно дополнить данными из других источников)
    const expenseTransactions = await this.transactionRepository.find({
      where: {
        type: "expense",
        status: "completed",
        createdAt: Between(start, end),
      },
    });

    const expenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const profit = revenue - expenses;

    return {
      revenue,
      expenses,
      profit,
      period: { start, end },
      transactions: {
        income: periodPayments.length,
        expense: expenseTransactions.length,
        total: periodPayments.length + expenseTransactions.length,
      },
    };
  }

  async getCommissions(query: any) {
    const {
      page = 1,
      pageSize = 20,
      masterId,
      status,
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = { type: "commission" };
    if (masterId) {
      where.masterId = masterId;
    }
    if (status) {
      where.status = status;
    }
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.transactionRepository.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip,
      take,
    });

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async createPayout(payoutData: any, userId: string) {
    const payout = this.payoutRepository.create({
      ...payoutData,
      requestedBy: userId,
    });
    return this.payoutRepository.save(payout);
  }

  async getReports(query: any) {
    // TODO: Generate financial reports
    return [];
  }
}

