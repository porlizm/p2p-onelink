import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity('vendor_contact')
export class VendorContact {
  @PrimaryGeneratedColumn('uuid')
  contact_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.contacts)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'varchar', length: 255 })
  contact_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;
}
