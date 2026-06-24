import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { GoodsReceipt } from './goods-receipt.entity';
import { Company } from './company.entity';
import { CostCenter } from './cost-center.entity';
import { InvoiceLine } from './invoice-line.entity';
import { InvoiceAttachment } from './invoice-attachment.entity';
import { CreditDebitNote } from './credit-debit-note.entity';
import { InvoiceStatus } from '@p2p/shared';

@Entity('invoice')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  invoice_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  invoice_no: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'uuid', nullable: true })
  po_id: string | null;

  @ManyToOne(() => PurchaseOrder, { nullable: true })
  @JoinColumn({ name: 'po_id' })
  po: PurchaseOrder | null;

  @Column({ type: 'uuid', nullable: true })
  gr_id: string | null;

  @ManyToOne(() => GoodsReceipt, { nullable: true })
  @JoinColumn({ name: 'gr_id' })
  gr: GoodsReceipt | null;

  @Column({ type: 'uuid' })
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'varchar', length: 50 })
  invoice_type: string; // Domestic, Foreign, PO, NonPO, GRAfterPayment

  @Column({ type: 'date' })
  invoice_date: Date;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'varchar', length: 20, default: '3Way' })
  match_type: string; // 2Way, 3Way

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  match_status: string; // Pending, Matched, Mismatch

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  vat_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  wht_amount: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gl_account_code: string | null;

  @Column({ type: 'uuid', nullable: true })
  cost_center_id: string | null;

  @ManyToOne(() => CostCenter, { nullable: true })
  @JoinColumn({ name: 'cost_center_id' })
  cost_center: CostCenter | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  project_code: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_amount: number;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  dup_check_key: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: InvoiceStatus.CREATED,
  })
  status: InvoiceStatus;

  @Column({ type: 'varchar', length: 50, default: 'KeyIn' })
  created_via: string; // KeyIn, OCR, API

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => InvoiceLine, (line) => line.invoice, { cascade: true })
  lines: InvoiceLine[];

  @OneToMany(() => InvoiceAttachment, (att) => att.invoice, { cascade: true })
  attachments: InvoiceAttachment[];

  @OneToMany(() => CreditDebitNote, (note) => note.invoice, { cascade: true })
  credit_debit_notes: CreditDebitNote[];
}
