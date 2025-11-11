import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

export enum SyncOperation {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

@Entity("sync_changes")
export class SyncChanges {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  @Index()
  entityType: string; // 'contact' | 'deal' | 'task' | 'user' | 'order'

  @Column({ type: "uuid" })
  @Index()
  entityId: string;

  @Column({
    type: "enum",
    enum: SyncOperation,
  })
  @Index()
  operation: SyncOperation; // INSERT, UPDATE, DELETE

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Index()
  changeTimestamp: Date;

  @Column({ type: "boolean", default: false })
  @Index()
  processed: boolean; // Обработано ли изменение для синхронизации

  @CreateDateColumn()
  createdAt: Date;
}

