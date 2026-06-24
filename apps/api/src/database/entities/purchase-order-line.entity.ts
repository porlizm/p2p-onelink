import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { PurchaseRequisitionLine } from './purchase-requisition-line.entity';
import { Item } from './item.entity';

@Entity('purchase_order_line')
export class PurchaseOrderLine {
  @PrimaryGeneratedColumn('uuid')
  po_line_id: string;

  @Column({ type: 'uuid' })
  po_id: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'po_id' })
  po: PurchaseOrder;

  @Column({ type: 'uuid', nullable: true })
  pr_line_id: string | null;

  @ManyToOne(() => PurchaseRequisitionLine, { nullable: true })
  @JoinColumn({ name: 'pr_line_id' })
  pr_line: PurchaseRequisitionLine | null;

  @Column({ type: 'uuid', nullable: true })
  item_id: string | null;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: Item | null;

  @Column({ type: 'varchar', length: 255 })
  item_name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  received_quantity: number;

  @Column({ type: 'varchar', length: 50 })
  uom: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_price: number;
}
