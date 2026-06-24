import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity('vendor_catalog_submission')
export class VendorCatalogSubmission {
  @PrimaryGeneratedColumn('uuid')
  submission_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'jsonb' })
  items: Array<{
    item_name: string;
    item_type: string;
    uom: string;
    unit_price: number;
    effective_date?: string;
    expiry_date?: string;
  }>;

  @Column({ type: 'varchar', length: 50, default: 'PendingApproval' })
  status: string; // 'PendingApproval', 'Approved', 'Rejected'

  @Column({ type: 'uuid', nullable: true })
  reviewed_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
