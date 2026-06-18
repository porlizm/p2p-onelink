import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from './item.entity';
import { Vendor } from './vendor.entity';

@Entity('item_price')
export class ItemPrice {
  @PrimaryGeneratedColumn('uuid')
  price_id: string;

  @Column({ type: 'uuid' })
  item_id: string;

  @ManyToOne(() => Item, (item) => item.prices)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'uuid', nullable: true })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_price: number;

  @Column({ type: 'date', nullable: true })
  effective_date: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ type: 'varchar', length: 50, default: 'Active' })
  status: string;
}
