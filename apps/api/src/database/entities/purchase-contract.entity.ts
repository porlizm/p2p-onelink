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

  @Column({ type: 'varchar', length: 50, default: 'Draft' })
  status: string; // 'Draft', 'PendingSignature', 'Signed', 'Expired'

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
