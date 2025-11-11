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

@Entity("crm_communications")
export class Communication {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  @Index()
  crmId: string;

  @Column({ nullable: true })
  @Index()
  crmType: string;

  @Column({ type: "uuid", nullable: true })
  @Index()
  contactId: string;

  @ManyToOne(() => Contact, (contact) => contact.communications, {
    nullable: true,
  })
  @JoinColumn({ name: "contactId" })
  contact: Contact;

  @Column()
  type: string; // 'call' | 'email' | 'message' | 'meeting'

  @Column({ type: "text", nullable: true })
  content: string;

  @Column({ nullable: true })
  direction: string; // 'incoming' | 'outgoing'

  @Column({ type: "int", nullable: true })
  duration: number; // для звонков в секундах

  @Column({ type: "int", default: 1 })
  syncVersion: number;

  @Column({ type: "timestamp", nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





