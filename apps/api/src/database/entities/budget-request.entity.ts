import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { CostCenter } from './cost-center.entity';

@Entity('budget_request')
export class BudgetRequest {
  @PrimaryGeneratedColumn('uuid')
  request_id: string;

  @Column({ type: 'uuid' })
  cost_center_id: string;

  @ManyToOne(() => CostCenter)
  @JoinColumn({ name: 'cost_center_id' })
  cost_center: CostCenter;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  requested_amount: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'varchar', length: 50, default: 'Pending' }) // Pending, Approved, Rejected
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  created_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
