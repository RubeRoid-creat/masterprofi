import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Customer } from "./customer.entity";

@Entity("crm_customer_notes")
export class CustomerNote {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.notes)
  customer: Customer;

  @Column({ type: "uuid" })
  createdBy: string;

  @Column({ type: "text" })
  content: string;

  @Column({ nullable: true })
  type?: string; // 'note', 'follow-up', 'call', etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





