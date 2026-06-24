import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('bank_file')
export class BankFile {
  @PrimaryGeneratedColumn('uuid')
  bank_file_id: string;

  @Column({ type: 'varchar', length: 100 })
  file_name: string;

  @Column({ type: 'uuid' })
  proposal_id: string;

  @Column({ type: 'text' })
  file_content: string;

  @Column({ type: 'varchar', length: 50, default: 'Success' }) // Success, Failed, Retrying
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
