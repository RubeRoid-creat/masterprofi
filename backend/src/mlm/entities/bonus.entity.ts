import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum BonusType {
  REFERRAL = "referral",
  ORDER_COMMISSION = "order_commission",
  LEVEL_BONUS = "level_bonus",
  MONTHLY_BONUS = "monthly_bonus",
  WITHDRAWAL = "withdrawal",
}

export enum BonusStatus {
  PENDING = "pending",
  APPROVED = "approved",
  PAID = "paid",
  CANCELLED = "cancelled",
}

@Entity("bonuses")
export class Bonus {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: "enum",
    enum: BonusType,
    default: BonusType.REFERRAL,
  })
  type: BonusType;

  @Column({
    type: "enum",
    enum: BonusStatus,
    default: BonusStatus.PENDING,
  })
  status: BonusStatus;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  referralId: string;

  @Column({ type: "int", default: 1 })
  level: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  commissionRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
