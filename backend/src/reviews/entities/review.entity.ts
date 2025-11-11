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
import { Order } from "../../orders/entities/order.entity";

@Entity("reviews")
@Index(["masterId", "orderId"], { unique: true }) // Один отзыв на заказ
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "master_id" })
  master: User;

  @Column()
  masterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "client_id" })
  client: User;

  @Column()
  clientId: string;

  @Column({ type: "int" })
  rating: number; // 1-5 звезд

  @Column({ nullable: true, type: "text" })
  comment: string;

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

