import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("master_profiles")
export class MasterProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User, (user) => user.masterProfile)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  userId: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ type: "int", nullable: true })
  experience: number;

  @Column({ nullable: true, type: "text" })
  bio: string;

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: "int", default: 0 })
  reviewsCount: number;

  // MLM statistics
  @Column({ type: "int", default: 0 })
  referralsCount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalCommissions: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  availableBalance: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  withdrawnAmount: number;

  // Geolocation fields
  @Column({ nullable: true })
  address: string;

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: "int", nullable: true })
  serviceRadius: number; // радиус обслуживания в км

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
