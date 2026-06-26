import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Asset } from './asset.entity';
import { BusinessUnit } from './business-unit.entity';

@Entity('p2p_asset_allocation')
export class AssetAllocation {
  @PrimaryGeneratedColumn('uuid')
  allocation_id: string;

  @Column({ type: 'uuid' })
  asset_id: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'uuid' })
  to_bu_id: string;

  @ManyToOne(() => BusinessUnit)
  @JoinColumn({ name: 'to_bu_id' })
  to_bu: BusinessUnit;

  @Column({ type: 'int', default: 1 })
  allocated_qty: number;

  @Column({ type: 'varchar', length: 50 })
  allocation_type: string; // 'Distribution' | 'Rental'

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  rental_rate: number;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date | null;

  @Column({ type: 'varchar', length: 50, default: 'Active' })
  status: string; // 'Active' | 'Returned' | 'Closed'

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
