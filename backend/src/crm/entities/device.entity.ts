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
import { User } from "../../users/entities/user.entity";

@Entity("devices")
export class Device {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ unique: true })
  @Index()
  deviceId: string; // Уникальный ID устройства (например, UUID из мобильного приложения)

  @Column({ nullable: true })
  deviceName?: string; // Название устройства (например, "iPhone 15 Pro")

  @Column({ nullable: true })
  platform?: string; // 'ios' | 'android' | 'web'

  @Column({ nullable: true })
  appVersion?: string; // Версия приложения

  @Column({ nullable: true })
  osVersion?: string; // Версия ОС

  @Column({ nullable: true })
  fcmToken?: string; // FCM токен для push-уведомлений

  @Column({ type: "boolean", default: true })
  isActive: boolean; // Активно ли устройство

  @Column({ type: "timestamp", nullable: true })
  lastActiveAt?: Date; // Время последней активности

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>; // Дополнительные метаданные

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

