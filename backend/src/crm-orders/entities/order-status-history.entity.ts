import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("crm_order_status_history")
export class OrderStatusHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  orderId: string;

  @Column()
  status: string;

  @Column({ type: "uuid" })
  changedBy: string;

  @Column({ type: "text", nullable: true })
  comment?: string;

  @CreateDateColumn()
  timestamp: Date;
}





