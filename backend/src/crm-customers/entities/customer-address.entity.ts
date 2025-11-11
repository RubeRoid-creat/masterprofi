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

@Entity("crm_customer_addresses")
export class CustomerAddress {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.addresses)
  customer: Customer;

  @Column()
  type: string; // 'home', 'work', 'billing', etc.

  @Column()
  address: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





