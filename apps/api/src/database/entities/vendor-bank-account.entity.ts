import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity('vendor_bank_account')
export class VendorBankAccount {
  @PrimaryGeneratedColumn('uuid')
  bank_account_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.bank_accounts)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'varchar', length: 100 })
  bank_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank_branch: string;

  @Column({ type: 'varchar', length: 50 })
  account_no: string;

  @Column({ type: 'varchar', length: 255 })
  account_name: string;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;
}
