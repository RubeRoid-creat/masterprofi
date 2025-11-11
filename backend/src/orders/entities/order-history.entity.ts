import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from "typeorm";
import { Order } from "./order.entity";
import { User } from "../../users/entities/user.entity";

export enum OrderHistoryAction {
  CREATED = "created",
  STATUS_CHANGED = "status_changed",
  MASTER_ASSIGNED = "master_assigned",
  MASTER_CHANGED = "master_changed",
  AMOUNT_CHANGED = "amount_changed",
  DESCRIPTION_CHANGED = "description_changed",
  UPDATED = "updated",
}

@Entity("order_history")
@Index(["orderId", "createdAt"])
export class OrderHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  orderId: string;

  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order: Order;

  @Column() // action хранится как varchar, не enum
  action: string; // OrderHistoryAction - хранится как varchar

  @Column({ type: "text", nullable: true })
  oldValue: string;

  @Column({ type: "text", nullable: true })
  newValue: string;

  @Column({ nullable: true })
  userId: string; // В таблице используется userId, не changedByUserId

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userId" })
  changedBy: User;

  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}

