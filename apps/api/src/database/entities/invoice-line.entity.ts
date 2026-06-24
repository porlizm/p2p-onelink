import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';
import { PurchaseOrderLine } from './purchase-order-line.entity';
import { Item } from './item.entity';
import { CostCenter } from './cost-center.entity';

@Entity('invoice_line')
export class InvoiceLine {
  @PrimaryGeneratedColumn('uuid')
  invoice_line_id: string;

  @Column({ type: 'uuid' })
  invoice_id: string;

  @ManyToOne(() => Invoice, (inv) => inv.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'uuid', nullable: true })
  po_line_id: string | null;

  @ManyToOne(() => PurchaseOrderLine, { nullable: true })
  @JoinColumn({ name: 'po_line_id' })
  po_line: PurchaseOrderLine | null;

  @Column({ type: 'uuid' })
  item_id: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  qty: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  line_total: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  expense_code: string | null;

  @Column({ type: 'uuid', nullable: true })
  cost_center_id: string | null;

  @ManyToOne(() => CostCenter, { nullable: true })
  @JoinColumn({ name: 'cost_center_id' })
  cost_center: CostCenter | null;
}
