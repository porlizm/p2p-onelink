import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { Company } from './company.entity';

@Entity('vendor_company_mapping')
export class VendorCompanyMapping {
  @PrimaryGeneratedColumn('uuid')
  mapping_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.company_mappings)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'uuid' })
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sap_card_code: string;

  @Column({ type: 'boolean', default: true })
  is_active_in_company: boolean;
}
