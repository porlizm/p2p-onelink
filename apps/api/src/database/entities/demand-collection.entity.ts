import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Company } from './company.entity';
import { AnnualPlan } from './annual-plan.entity';

@Entity('demand_collection')
export class DemandCollection {
  @PrimaryGeneratedColumn('uuid')
  demand_id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'varchar', length: 255 })
  item_name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  estimated_amount: number;

  @Column({ type: 'uuid', nullable: true })
  plan_id: string | null;

  @ManyToOne(() => AnnualPlan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'plan_id' })
  plan: AnnualPlan | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
