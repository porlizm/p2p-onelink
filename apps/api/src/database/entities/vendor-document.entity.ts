import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity('vendor_document')
export class VendorDocument {
  @PrimaryGeneratedColumn('uuid')
  document_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.documents)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'varchar', length: 100 })
  document_type: string;

  @Column({ type: 'varchar', length: 500 })
  file_url: string;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date | null;

  @Column({ type: 'varchar', length: 50, default: 'Valid' })
  status: string;
}
