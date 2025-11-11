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

@Entity("crm_customer_documents")
export class CustomerDocument {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.documents)
  customer: Customer;

  @Column()
  type: string; // 'contract', 'warranty', 'invoice', etc.

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  mimeType?: string;

  @Column({ type: "bigint", nullable: true })
  fileSize?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





