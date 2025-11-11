import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("crm_invoices")
export class Invoice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  orderId: string;

  @Column({ unique: true })
  number: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "date" })
  dueDate: Date;

  @Column({ default: "draft" })
  status: string; // 'draft', 'sent', 'paid', 'overdue', 'cancelled'

  @Column({ type: "text", nullable: true })
  filePath?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





