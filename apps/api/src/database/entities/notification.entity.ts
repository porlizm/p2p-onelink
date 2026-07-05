import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  notification_id: string;

  @Column({ type: 'uuid' })
  recipient_user_id: string;

  @Column({ type: 'varchar', length: 50 })
  channel: string;

  @Column({ type: 'varchar', length: 100 })
  trigger_event: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  read_flag: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  document_no: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  action_required: string | null;

  @Column({ type: 'timestamp', nullable: true })
  due_at: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deep_link: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
