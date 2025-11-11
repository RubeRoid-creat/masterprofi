import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum SyncOperation {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum SyncQueueStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  ERROR = "ERROR",
  PROCESSING = "PROCESSING",
}

@Entity("crm_sync_queue")
export class SyncQueue {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  entityType: string; // 'contact' | 'deal' | 'task' | 'communication' | 'product'

  @Column({ type: "uuid", nullable: true })
  @Index()
  entityId: string;

  @Column({
    type: "enum",
    enum: SyncOperation,
  })
  operation: SyncOperation;

  @Column({ type: "jsonb" })
  payload: Record<string, any>;

  @Column({
    type: "enum",
    enum: SyncQueueStatus,
    default: SyncQueueStatus.PENDING,
  })
  @Index()
  status: SyncQueueStatus;

  @Column({ type: "int", default: 0 })
  retryCount: number;

  @Column({ type: "text", nullable: true })
  errorMessage: string;

  @Column({ type: "uuid", nullable: true })
  @Index()
  userId: string; // Пользователь, который внес изменение

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  processedAt: Date;
}





