import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from "typeorm";
import { Contact } from "./contact.entity";

@Entity("crm_deals")
export class Deal {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  @Index()
  crmId: string;

  @Column({ nullable: true })
  @Index()
  crmType: string;

  @Column()
  title: string;

  @Column({ type: "uuid", nullable: true })
  @Index()
  contactId: string;

  @ManyToOne(() => Contact, (contact) => contact.deals, { nullable: true })
  @JoinColumn({ name: "contactId" })
  contact: Contact;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  stage: string; // 'new' | 'negotiation' | 'won' | 'lost'

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "int", default: 1 })
  @Index()
  version: number; // Версия для синхронизации

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Index()
  lastModified: Date; // Последнее изменение

  @Column({ type: "int", default: 1 })
  syncVersion: number; // Для обратной совместимости

  @Column({ type: "timestamp", nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





