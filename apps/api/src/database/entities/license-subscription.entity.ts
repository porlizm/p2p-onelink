import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('license_subscription')
export class LicenseSubscription {
  @PrimaryGeneratedColumn('uuid')
  subscription_id: string;

  @Column({ type: 'varchar', length: 255 })
  license_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  license_key: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'int', default: 1 })
  seats_count: number;

  @Column({ type: 'uuid', nullable: true })
  po_id: string;

  @ManyToOne(() => PurchaseOrder, { nullable: true })
  @JoinColumn({ name: 'po_id' })
  po: PurchaseOrder;

  @Column({ type: 'timestamp', nullable: true })
  expiry_date: Date;

  @Column({ type: 'varchar', length: 50, default: 'Active' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
