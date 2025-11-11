import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("crm_payout_requests")
export class PayoutRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  masterId: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: string;

  @Column({ default: "pending" })
  status: string; // 'pending', 'approved', 'rejected', 'processed'

  @Column({ type: "uuid" })
  requestedBy: string;

  @Column({ type: "uuid", nullable: true })
  approvedBy?: string;

  @Column({ type: "timestamp", nullable: true })
  processedAt?: Date;

  @Column({ type: "text", nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





