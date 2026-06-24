import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('credit_debit_note')
export class CreditDebitNote {
  @PrimaryGeneratedColumn('uuid')
  cn_dn_id: string;

  @Column({ type: 'uuid', nullable: true })
  invoice_id: string | null;

  @ManyToOne(() => Invoice, (inv) => inv.credit_debit_notes, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice | null;

  @Column({ type: 'uuid', nullable: true })
  po_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  vendor_id: string | null;

  @Column({ type: 'varchar', length: 20 })
  type: string; // Credit, Debit

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'varchar', length: 50, default: 'Approved' })
  status: string;
}
