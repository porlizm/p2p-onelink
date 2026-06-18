import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BusinessUnit } from './business-unit.entity';

@Entity('company')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  company_id: string;

  @Column({ type: 'varchar', length: 255 })
  company_name: string;

  @Column({ type: 'varchar', length: 50 })
  sap_company_code: string;

  @Column({ type: 'varchar', length: 20 })
  tax_id: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => BusinessUnit, (bu) => bu.company)
  business_units: BusinessUnit[];
}
