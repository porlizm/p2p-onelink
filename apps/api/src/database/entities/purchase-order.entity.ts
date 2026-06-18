import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { Company } from './company.entity';
import { PurchaseRequisition } from './purchase-requisition.entity';
import { PurchaseOrderLine } from './purchase-order-line.entity';
import { PurchaseOrderStatus } from '@p2p/shared';

@Entity('purchase_order')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  po_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  po_no: string;

  @Column({ type: 'uuid', nullable: true })
  pr_id: string | null;

  @ManyToOne(() => PurchaseRequisition, { nullable: true })
  @JoinColumn({ name: 'pr_id' })
  pr: PurchaseRequisition;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'uuid' })
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({
    type: 'varchar',
    length: 50,
    default: PurchaseOrderStatus.SENT_TO_VENDOR,
  })
  status: PurchaseOrderStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'int', default: 0 })
  revision_no: number;

  @Column({ type: 'timestamp', nullable: true })
  estimated_delivery_date: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => PurchaseOrderLine, (line) => line.po, { cascade: true })
  lines: PurchaseOrderLine[];
}
