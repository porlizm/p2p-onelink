import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  audit_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 100 })
  entity_type: string;

  @Column({ type: 'uuid' })
  entity_id: string;

  @Column({ type: 'jsonb', nullable: true })
  before_value_json: any;

  @Column({ type: 'jsonb', nullable: true })
  after_value_json: any;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address: string;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}
