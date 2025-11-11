import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Deal } from "./deal.entity";
import { Communication } from "./communication.entity";

@Entity("crm_contacts")
export class Contact {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  @Index()
  crmId: string; // ID в внешней CRM системе

  @Column({ nullable: true })
  @Index()
  crmType: string; // 'amocrm' | 'bitrix24'

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  position: string;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ default: "active" })
  status: string;

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

  @OneToMany(() => Deal, (deal) => deal.contact)
  deals: Deal[];

  @OneToMany(() => Communication, (communication) => communication.contact)
  communications: Communication[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





