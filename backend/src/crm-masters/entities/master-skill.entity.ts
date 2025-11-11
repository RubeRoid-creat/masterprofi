import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Master } from "./master.entity";

@Entity("crm_master_skills")
export class MasterSkill {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  masterId: string;

  @ManyToOne(() => Master, (master) => master.skills)
  master: Master;

  @Column()
  skillId: string; // Reference to skills catalog

  @Column()
  skillName: string;

  @Column({ default: "basic" })
  certificationLevel: string; // 'basic', 'intermediate', 'advanced', 'expert'

  @CreateDateColumn()
  createdAt: Date;
}





