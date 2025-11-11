import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("crm_transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  type: string; // 'income', 'expense', 'commission', 'payout'

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ default: "RUB" })
  currency: string;

  @Column({ default: "pending" })
  status: string; // 'pending', 'completed', 'failed', 'cancelled'

  @Column({ type: "uuid", nullable: true })
  @Index()
  orderId?: string;

  @Column({ type: "uuid", nullable: true })
  @Index()
  masterId?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





