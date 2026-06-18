import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseRequisition } from './purchase-requisition.entity';
import { Item } from './item.entity';
import { CostCenter } from './cost-center.entity';

@Entity('purchase_requisition_line')
export class PurchaseRequisitionLine {
  @PrimaryGeneratedColumn('uuid')
  line_id: string;

  @Column({ type: 'uuid' })
  pr_id: string;

  @ManyToOne(() => PurchaseRequisition, (pr) => pr.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pr_id' })
  pr: PurchaseRequisition;

  @Column({ type: 'uuid', nullable: true })
  item_id: string | null;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'varchar', length: 255 })
  item_name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 50 })
  uom: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_price: number;

  @Column({ type: 'uuid' })
  cost_center_id: string;

  @ManyToOne(() => CostCenter)
  @JoinColumn({ name: 'cost_center_id' })
  cost_center: CostCenter;

  @Column({ type: 'varchar', length: 255, nullable: true })
  quotation_url: string | null;
}
