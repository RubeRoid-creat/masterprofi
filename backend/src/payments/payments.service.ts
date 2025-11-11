import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Payment } from "./entities/payment.entity";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { NotificationGateway } from "../notification/notification.gateway";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private notificationGateway: NotificationGateway
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentsRepository.create(createPaymentDto);
    const savedPayment = await this.paymentsRepository.save(payment);
    
    // Отправляем WebSocket событие
    this.notificationGateway.emitPaymentCreated({
      id: savedPayment.id,
      userId: savedPayment.userId,
      orderId: savedPayment.orderId,
      amount: savedPayment.amount,
      status: savedPayment.status,
      createdAt: savedPayment.createdAt,
    });
    
    return savedPayment;
  }

  async findAll(): Promise<Payment[]> {
    try {
      return await this.paymentsRepository.find({
        relations: ["user"],
        order: { createdAt: "DESC" },
      });
    } catch (error: any) {
      console.error("Error in payments.findAll:", error);
      // Если ошибка с relations, пробуем без них
      if (error.message?.includes("relation") || error.message?.includes("join")) {
        return await this.paymentsRepository.find({
          order: { createdAt: "DESC" },
        });
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto
  ): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    const updatedPayment = await this.paymentsRepository.save(payment);
    
    // Отправляем WebSocket событие
    this.notificationGateway.emitPaymentUpdated({
      id: updatedPayment.id,
      userId: updatedPayment.userId,
      orderId: updatedPayment.orderId,
      amount: updatedPayment.amount,
      status: updatedPayment.status,
      updatedAt: updatedPayment.updatedAt,
    });
    
    return updatedPayment;
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentsRepository.remove(payment);
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { userId },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { orderId },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({
      where: { transactionId },
      relations: ["user"],
    });
  }
}
