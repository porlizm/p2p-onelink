import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from './item.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { BusinessUnit } from './business-unit.entity';

@Entity('p2p_asset')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  asset_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  asset_tag: string;

  @Column({ type: 'varchar', length: 255 })
  asset_name: string;

  @Column({ type: 'varchar', length: 50 })
  asset_type: string; // 'Goods' | 'Service' | 'Rental' | 'License'

  @Column({ type: 'uuid', nullable: true })
  item_id: string | null;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: Item | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  unit_price: number;

  @Column({ type: 'int', default: 1 })
  total_qty: number;

  @Column({ type: 'int', default: 0 })
  distributed_qty: number;

  @Column({ type: 'int', default: 1 })
  remaining_qty: number;

  @Column({ type: 'uuid' })
  owner_bu_id: string;

  @ManyToOne(() => BusinessUnit)
  @JoinColumn({ name: 'owner_bu_id' })
  owner_bu: BusinessUnit;

  @Column({ type: 'timestamp', nullable: true })
  acquisition_date: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  license_key: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expiry_date: Date | null;

  @Column({ type: 'uuid', nullable: true })
  po_id: string | null;

  @ManyToOne(() => PurchaseOrder, { nullable: true })
  @JoinColumn({ name: 'po_id' })
  po: PurchaseOrder | null;

  @Column({ type: 'varchar', length: 50, default: 'In Stock' })
  status: string; // 'In Stock' | 'Distributed' | 'Rented' | 'Sold' | 'Scrapped'

  @Column({ type: 'varchar', length: 50, nullable: true })
  disposal_type: string | null; // 'Sold' | 'Scrapped'

  @Column({ type: 'varchar', length: 255, nullable: true })
  disposal_reason: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  disposal_amount: number | null;

  @Column({ type: 'timestamp', nullable: true })
  disposed_at: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
