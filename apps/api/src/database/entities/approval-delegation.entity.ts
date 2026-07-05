import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('approval_delegation')
export class ApprovalDelegation {
  @PrimaryGeneratedColumn('uuid')
  delegation_id: string;

  @Column({ type: 'uuid' })
  delegator_user_id: string;

  @Column({ type: 'uuid' })
  delegate_user_id: string;

  @Column({ type: 'varchar', length: 100 })
  role: string;

  @Column({ type: 'timestamp' })
  effective_from: Date;

  @Column({ type: 'timestamp' })
  effective_to: Date;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
