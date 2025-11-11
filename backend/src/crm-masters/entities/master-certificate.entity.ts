import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Master } from "./master.entity";

@Entity("crm_master_certificates")
export class MasterCertificate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  masterId: string;

  @ManyToOne(() => Master, (master) => master.certificates)
  master: Master;

  @Column()
  name: string;

  @Column()
  issuer: string;

  @Column({ type: "date" })
  issueDate: Date;

  @Column({ type: "date", nullable: true })
  expiryDate?: Date;

  @Column()
  filePath: string;

  @Column({ default: true })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





