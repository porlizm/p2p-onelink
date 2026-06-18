import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { CostCenter } from './cost-center.entity';

@Entity('business_unit')
export class BusinessUnit {
  @PrimaryGeneratedColumn('uuid')
  bu_id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @ManyToOne(() => Company, (company) => company.business_units)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', nullable: true })
  parent_bu_id: string;

  @ManyToOne(() => BusinessUnit, { nullable: true })
  @JoinColumn({ name: 'parent_bu_id' })
  parent_bu: BusinessUnit;

  @Column({ type: 'varchar', length: 50 })
  bu_code: string;

  @Column({ type: 'varchar', length: 255 })
  bu_name: string;

  @OneToMany(() => CostCenter, (cc) => cc.business_unit)
  cost_centers: CostCenter[];
}
