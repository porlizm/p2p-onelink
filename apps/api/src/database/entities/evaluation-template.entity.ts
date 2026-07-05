import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('evaluation_template')
export class EvaluationTemplate {
  @PrimaryGeneratedColumn('uuid')
  template_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  applies_to: string; // 'VendorEvaluation' | 'Sourcing' | 'Bidding'

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vendor_type: string | null;

  @Column({ type: 'jsonb' })
  criteria: { key: string; label: string; weight: number }[];

  @Column({ type: 'int', default: 1 })
  version_no: number;

  @Column({ type: 'varchar', length: 50, default: 'Active' })
  status: string; // 'Active' | 'Archived'

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
