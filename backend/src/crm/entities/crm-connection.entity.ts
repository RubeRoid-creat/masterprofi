import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum CrmType {
  AMOCRM = "amocrm",
  BITRIX24 = "bitrix24",
}

@Entity("crm_connections")
export class CrmConnection {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  userId: string;

  @Column({
    type: "enum",
    enum: CrmType,
  })
  @Index()
  crmType: CrmType;

  @Column({ nullable: true })
  apiUrl: string;

  @Column({ type: "text", nullable: true })
  accessToken: string; // Зашифрованный токен

  @Column({ type: "text", nullable: true })
  refreshToken: string; // Зашифрованный refresh token

  @Column({ type: "timestamp", nullable: true })
  tokenExpiresAt: Date;

  @Column({ nullable: true })
  clientId: string;

  @Column({ type: "text", nullable: true })
  clientSecret: string; // Зашифрованный секрет

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "jsonb", nullable: true })
  settings: Record<string, any>; // Дополнительные настройки

  @Column({ type: "timestamp", nullable: true })
  lastSyncAt: Date;

  @Column({ type: "text", nullable: true })
  lastError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





