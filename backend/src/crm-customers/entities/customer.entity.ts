import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { CustomerContact } from "./customer-contact.entity";
import { CustomerAddress } from "./customer-address.entity";
import { CustomerNote } from "./customer-note.entity";
import { CustomerDocument } from "./customer-document.entity";

@Entity("crm_customers")
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  userId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  @Index()
  email?: string;

  @Column({ nullable: true })
  @Index()
  phone?: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  taxId?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  lifetimeValue: number;

  @Column({ default: "active" })
  status: string;

  @OneToMany(() => CustomerContact, (contact) => contact.customer, { cascade: true })
  contacts: CustomerContact[];

  @OneToMany(() => CustomerAddress, (address) => address.customer, { cascade: true })
  addresses: CustomerAddress[];

  @OneToMany(() => CustomerNote, (note) => note.customer, { cascade: true })
  notes: CustomerNote[];

  @OneToMany(() => CustomerDocument, (document) => document.customer, { cascade: true })
  documents: CustomerDocument[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt?: Date;
}





