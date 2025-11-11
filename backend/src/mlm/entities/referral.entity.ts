import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("referrals")
export class Referral {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "referrer_id" })
  referrer: User;

  @Column()
  referrerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "referred_id" })
  referred: User;

  @Column()
  referredId: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalEarned: number;

  @Column({ type: "int", default: 0 })
  ordersCount: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
