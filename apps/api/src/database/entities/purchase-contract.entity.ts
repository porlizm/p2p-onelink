import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity('purchase_contract')
export class PurchaseContract {
  @PrimaryGeneratedColumn('uuid')
  contract_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  contract_no: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  remaining_amount: number;

  @Column({ type: 'varchar', length: 50, default: 'Sales' })
  contract_type: string; // 'Sales', 'Rental', 'Service', 'Warranty'

  @Column({ type: 'varchar', length: 50, default: 'Custom' })
  contract_period: string; // '6 Months', '1 Year', '3 Years', 'Custom'

  @Column({ type: 'jsonb', nullable: true })
  resources: { role: string; rate: number; unit: 'hour' | 'day' | 'month'; quantity: number }[] | null;

  @Column({ type: 'jsonb', nullable: true })
  rental_details: { billing_cycle: string; installment_amount: number; return_conditions?: string } | null;

  @Column({ type: 'jsonb', nullable: true })
  warranty_details: { sla_level: string; contact_person: string; start_date: Date; end_date: Date } | null;

  @Column({ type: 'uuid', nullable: true })
  parent_contract_id: string | null;

  @Column({ type: 'int', default: 1 })
  version_no: number;

  @Column({ type: 'varchar', length: 50, default: 'Original' })
  contract_class: string; // 'Original', 'Amendment', 'Addendum'

  @Column({ type: 'varchar', length: 50, default: 'Draft' })
  status: string; // 'Draft', 'PendingApproval', 'Approved', 'PendingSignature', 'Signed', 'Rejected', 'Expired', 'Superceded'

  @Column({ type: 'varchar', length: 255, nullable: true })
  document_url: string;

  @Column({ type: 'jsonb', nullable: true })
  signatures: {
    buyer?: { signed_at: string; ip: string; name: string };
    vendor?: { signed_at: string; ip: string; name: string };
  };

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
