import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('doa_rule')
export class DOARule {
  @PrimaryGeneratedColumn('uuid')
  rule_id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'varchar', length: 50 })
  doc_type: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount_min: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount_max: number;

  @Column({ type: 'int' })
  approval_level: number;

  @Column({ type: 'varchar', length: 100 })
  approver_role: string;
}
