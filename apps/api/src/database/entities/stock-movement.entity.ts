import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Item } from './item.entity';
import { Company } from './company.entity';
import { StockMovementType, StockRecordStatus } from '@p2p/shared';

@Entity('stock_movement')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  movement_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  movement_no: string;

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

  @Column({ type: 'varchar', length: 100, default: 'MAIN' })
  warehouse: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lot_no: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serial_no: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expiry_date: Date | null;

  @Column({ type: 'varchar', length: 50 })
  movement_type: StockMovementType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  qty_in: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  qty_out: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  balance_after: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reference_doc_type: string | null;

  @Column({ type: 'uuid', nullable: true })
  reference_doc_id: string | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: StockRecordStatus.POSTED,
  })
  status: StockRecordStatus;

  @Column({ type: 'varchar', length: 50, default: 'NotSynced' })
  sap_sync_status: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
