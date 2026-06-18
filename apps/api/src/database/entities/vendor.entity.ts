import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VendorCompanyMapping } from './vendor-company-mapping.entity';
import { VendorContact } from './vendor-contact.entity';
import { VendorAddress } from './vendor-address.entity';
import { VendorBankAccount } from './vendor-bank-account.entity';
import { VendorDocument } from './vendor-document.entity';

@Entity('vendor')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  vendor_id: string;

  @Column({ type: 'varchar', length: 20 })
  tax_id: string;

  @Column({ type: 'varchar', length: 255 })
  vendor_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vendor_name_en: string;

  @Column({ type: 'varchar', length: 50 })
  vendor_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  business_category: string;

  @Column({ type: 'varchar', length: 50, default: 'PendingRegistration' })
  status: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  registered_date: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registered_by: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  evaluation_score: number;

  @Column({ type: 'boolean', default: true })
  is_dedup_master: boolean;

  @Column({ type: 'uuid', nullable: true })
  merged_into_vendor_id: string;

  @OneToMany(() => VendorCompanyMapping, (mapping) => mapping.vendor)
  company_mappings: VendorCompanyMapping[];

  @OneToMany(() => VendorContact, (contact) => contact.vendor)
  contacts: VendorContact[];

  @OneToMany(() => VendorAddress, (address) => address.vendor)
  addresses: VendorAddress[];

  @OneToMany(() => VendorBankAccount, (bank) => bank.vendor)
  bank_accounts: VendorBankAccount[];

  @OneToMany(() => VendorDocument, (doc) => doc.vendor)
  documents: VendorDocument[];
}
