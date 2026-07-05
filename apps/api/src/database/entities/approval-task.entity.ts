import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApprovalTaskStatus } from '@p2p/shared';

@Entity('approval_task')
export class ApprovalTask {
  @PrimaryGeneratedColumn('uuid')
  task_id: string;

  @Column({ type: 'varchar', length: 50 })
  document_type: string;

  @Column({ type: 'uuid' })
  document_id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'int' })
  step_level: number;

  @Column({ type: 'varchar', length: 100 })
  approver_role: string;

  @Column({ type: 'uuid', nullable: true })
  assigned_user_id: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: ApprovalTaskStatus.PENDING,
  })
  status: ApprovalTaskStatus;

  @Column({ type: 'timestamp' })
  sla_due_at: Date;

  @Column({ type: 'boolean', default: false })
  is_escalated: boolean;

  @Column({ type: 'uuid', nullable: true })
  decided_by: string | null;

  @Column({ type: 'timestamp', nullable: true })
  decided_at: Date | null;

  @Column({ type: 'text', nullable: true })
  decision_reason: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
