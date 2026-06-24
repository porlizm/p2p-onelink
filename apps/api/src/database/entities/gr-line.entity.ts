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

  @Column({ type: 'uuid' })
  po_line_id: string;

  @ManyToOne(() => PurchaseOrderLine)
  @JoinColumn({ name: 'po_line_id' })
  po_line: PurchaseOrderLine;

  @Column({ type: 'uuid', nullable: true })
  item_id: string | null;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: Item | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  qty_ordered: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  qty_received: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.0 })
  tolerance_percent: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  variance_qty: number;
}
