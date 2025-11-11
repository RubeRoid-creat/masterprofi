import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("crm_sync_status")
export class SyncStatus {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  userId: string;

  @Column({ nullable: true })
  crmType: string; // 'amocrm' | 'bitrix24'

  @Column({ type: "timestamp", nullable: true })
  lastSyncAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastFullSyncAt: Date;

  @Column({ default: false })
  isSyncing: boolean;

  @Column({ type: "int", default: 0 })
  totalContacts: number;

  @Column({ type: "int", default: 0 })
  totalDeals: number;

  @Column({ type: "int", default: 0 })
  totalTasks: number;

  @Column({ type: "int", default: 0 })
  pendingChanges: number;

  @Column({ type: "text", nullable: true })
  lastError: string;

  @Column({ nullable: true, unique: true })
  @Index()
  syncToken?: string; // Токен для отслеживания состояния синхронизации

  @Column({ nullable: true })
  deviceId?: string; // ID устройства для синхронизации

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





