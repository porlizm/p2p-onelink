import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GoodsReceipt } from './goods-receipt.entity';
import { PurchaseOrderLine } from './purchase-order-line.entity';
import { Item } from './item.entity';

@Entity('gr_line')
export class GoodsReceiptLine {
  @PrimaryGeneratedColumn('uuid')
  gr_line_id: string;

  @Column({ type: 'uuid' })
  gr_id: string;

  @ManyToOne(() => GoodsReceipt, (gr) => gr.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gr_id' })
  gr: GoodsReceipt;

  @Column({ type: 'uuid', nullable: true })
  po_line_id: string | null;

  @ManyToOne(() => PurchaseOrderLine, { nullable: true })
  @JoinColumn({ name: 'po_line_id' })
  po_line: PurchaseOrderLine | null;

  @Column({ type: 'uuid', nullable: true })
  item_id: string | null;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: Item | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  item_name: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  qty_ordered: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  qty_received: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.0 })
  tolerance_percent: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  variance_qty: number;

  @Column({ type: 'boolean', default: false })
  requires_qc: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  qc_passed_qty: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  qc_failed_qty: number;

  @Column({ type: 'varchar', length: 50, default: 'Passed' }) // 'Pending', 'Passed', 'Failed', 'Partial'
  qc_status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bin_location: string | null;

  @Column({ type: 'text', nullable: true })
  qc_remarks: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lot_no: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serial_no: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expiry_date: Date | null;
}
