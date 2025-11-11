import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PaymentType {
  ORDER_PAYMENT = "order_payment",
  COMMISSION = "commission",
  WITHDRAWAL = "withdrawal",
}

@Entity("payment")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ default: "pending" })
  status: string; // PaymentStatus - хранится как varchar, не enum

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  provider: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
