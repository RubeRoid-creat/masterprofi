import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { MasterSkill } from "./master-skill.entity";
import { MasterCertificate } from "./master-certificate.entity";

@Entity("crm_masters")
export class Master {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  userId: string;

  @Column({ default: "junior" })
  rank: string; // 'junior', 'middle', 'senior', 'expert'

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isAvailable: boolean;

  @Column({ type: "jsonb", nullable: true })
  schedule?: any;

  @Column({ type: "jsonb", nullable: true })
  serviceArea?: any; // Coordinates for service area

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  totalOrders: number;

  @Column({ default: 0 })
  completedOrders: number;

  @OneToMany(() => MasterSkill, (skill) => skill.master, { cascade: true })
  skills: MasterSkill[];

  @OneToMany(() => MasterCertificate, (cert) => cert.master, { cascade: true })
  certificates: MasterCertificate[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





