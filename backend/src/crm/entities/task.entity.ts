import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("crm_tasks")
export class Task {
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

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "uuid", nullable: true })
  @Index()
  relatedEntityId: string; // ID связанной сущности (контакт, сделка)

  @Column({ nullable: true })
  relatedEntityType: string; // 'contact' | 'deal'

  @Column({ type: "timestamp", nullable: true })
  dueDate: Date;

  @Column({ default: "pending" })
  status: string; // 'pending' | 'in_progress' | 'completed' | 'cancelled'

  @Column({ type: "uuid", nullable: true })
  @Index()
  assignedToUserId: string;

  @Column({ type: "int", default: 1 })
  syncVersion: number;

  @Column({ type: "timestamp", nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





