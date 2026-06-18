import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity('vendor_address')
export class VendorAddress {
  @PrimaryGeneratedColumn('uuid')
  address_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.addresses)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'varchar', length: 50, default: 'Billing' })
  address_type: string;

  @Column({ type: 'varchar', length: 500 })
  address_line1: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address_line2: string;

  @Column({ type: 'varchar', length: 100 })
  subdistrict: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  province: string;

  @Column({ type: 'varchar', length: 10 })
  postal_code: string;

  @Column({ type: 'varchar', length: 100, default: 'Thailand' })
  country: string;
}
