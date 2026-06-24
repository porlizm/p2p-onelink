import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('procurement_item_type')
export class ProcurementItemType {
  @PrimaryGeneratedColumn('uuid')
  type_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  type_code: string;

  @Column({ type: 'varchar', length: 100 })
  type_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  is_system_default: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
