import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from './item.entity';
import { Company } from './company.entity';

@Entity('stock')
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  stock_id: string;

  @Column({ type: 'uuid' })
  item_id: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'uuid' })
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  qty_onhand: number;

  @Column({ type: 'varchar', length: 100, default: 'MAIN' })
  warehouse: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  min_stock_level: number | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_sync_at: Date;
}
