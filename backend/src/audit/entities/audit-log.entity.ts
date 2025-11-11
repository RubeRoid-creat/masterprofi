import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum AuditAction {
  // Auth
  LOGIN = "login",
  LOGOUT = "logout",
  REGISTER = "register",
  TOKEN_REFRESH = "token_refresh",

  // User actions
  USER_CREATE = "user_create",
  USER_UPDATE = "user_update",
  USER_DELETE = "user_delete",
  USER_ACTIVATE = "user_activate",
  USER_DEACTIVATE = "user_deactivate",

  // Order actions
  ORDER_CREATE = "order_create",
  ORDER_UPDATE = "order_update",
  ORDER_DELETE = "order_delete",
  ORDER_STATUS_CHANGE = "order_status_change",

  // Payment actions
  PAYMENT_CREATE = "payment_create",
  PAYMENT_UPDATE = "payment_update",
  PAYMENT_DELETE = "payment_delete",
  PAYMENT_STATUS_CHANGE = "payment_status_change",

  // MLM actions
  MLM_COMMISSION_CALCULATED = "mlm_commission_calculated",
  MLM_BONUS_CREATED = "mlm_bonus_created",
  MLM_BONUS_PAID = "mlm_bonus_paid",

  // System
  SETTINGS_UPDATE = "settings_update",
  CONFIG_CHANGE = "config_change",
}

@Entity("audit_log")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({
    type: "enum",
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: "varchar", length: 255 })
  entityType: string; // 'user', 'order', 'payment', etc.

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "jsonb", nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  newValues: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
