import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessUnit } from './business-unit.entity';

@Entity('cost_center')
export class CostCenter {
  @PrimaryGeneratedColumn('uuid')
  cost_center_id: string;

  @Column({ type: 'uuid' })
  bu_id: string;

  @ManyToOne(() => BusinessUnit, (bu) => bu.cost_centers)
  @JoinColumn({ name: 'bu_id' })
  business_unit: BusinessUnit;

  @Column({ type: 'varchar', length: 50 })
  cc_code: string;

  @Column({ type: 'varchar', length: 255 })
  cc_name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  annual_budget_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget_reserved_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget_used_amount: number;

  @Column({ type: 'varchar', length: 4 })
  fiscal_year: string;
}
