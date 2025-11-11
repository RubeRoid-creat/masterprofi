import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Order } from "../../orders/entities/order.entity";
import { Message } from "./message.entity";

@Entity("chats")
export class Chat {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "client_id" })
  client: User;

  @Column()
  clientId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "master_id" })
  master: User;

  @Column({ nullable: true })
  masterId: string;

  @OneToMany(() => Message, (message) => message.chat, { cascade: true })
  messages: Message[];

  @Column({ default: false })
  isArchived: boolean;

  @Column({ nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}



