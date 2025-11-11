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

@Entity("crm_customer_contacts")
export class CustomerContact {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.contacts)
  customer: Customer;

  @Column()
  type: string; // 'email', 'phone', 'telegram', etc.

  @Column()
  value: string;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





