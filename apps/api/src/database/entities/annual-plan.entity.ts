import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('annual_plan')
export class AnnualPlan {
  @PrimaryGeneratedColumn('uuid')
  plan_id: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 255 })
  business_category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  budget_limit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  remaining_budget: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
