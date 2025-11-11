import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("crm_products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  @Index()
  crmId: string;

  @Column({ nullable: true })
  @Index()
  crmType: string;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: "int", default: 0 })
  stock: number;

  @Column({ type: "int", default: 1 })
  syncVersion: number;

  @Column({ type: "timestamp", nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





