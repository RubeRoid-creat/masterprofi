import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum SlotStatus {
  AVAILABLE = "available",
  BOOKED = "booked",
  BLOCKED = "blocked", // Заблокирован мастером
}

@Entity("schedule_slots")
@Index(["masterId", "startTime"], { unique: true })
export class ScheduleSlot {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "master_id" })
  master: User;

  @Column()
  masterId: string;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

  @Column({
    type: "enum",
    enum: SlotStatus,
    default: SlotStatus.AVAILABLE,
  })
  status: SlotStatus;

  @Column({ nullable: true })
  orderId: string; // ID заказа, если слот забронирован

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

