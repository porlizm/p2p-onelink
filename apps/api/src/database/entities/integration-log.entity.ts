import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('integration_log')
export class IntegrationLog {
  @PrimaryGeneratedColumn('uuid')
  log_id: string;

  @Column({ type: 'varchar', length: 100 })
  target_system: string;

  @Column({ type: 'varchar', length: 100 })
  doc_type: string;

  @Column({ type: 'uuid' })
  doc_id: string;

  @Column({ type: 'jsonb', nullable: true })
  request_payload: any;

  @Column({ type: 'jsonb', nullable: true })
  response_payload: any;

  @Column({ type: 'varchar', length: 50, default: 'Success' })
  status: string;

  @Column({ type: 'int', default: 0 })
  retry_count: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
