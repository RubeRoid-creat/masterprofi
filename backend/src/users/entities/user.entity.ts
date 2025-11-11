import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { MasterProfile } from "../../mlm/entities/master-profile.entity";
import { Order } from "../../orders/entities/order.entity";

export enum UserRole {
  CLIENT = "client",
  MASTER = "master",
  ADMIN = "admin",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column()
  passwordHash: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @OneToOne(() => MasterProfile, (profile) => profile.user)
  masterProfile: MasterProfile;

  @OneToMany(() => Order, (order) => order.client)
  orders: Order[];

  // MLM fields
  @Column({ nullable: true, unique: true })
  referralCode: string;

  @Column({ nullable: true })
  referrerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "referrerId" })
  referrer: User;

  @OneToMany(() => User, (user) => user.referrer)
  referrals: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
