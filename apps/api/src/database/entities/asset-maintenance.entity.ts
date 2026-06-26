import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Asset } from './asset.entity';

@Entity('asset_maintenance')
export class AssetMaintenance {
  @PrimaryGeneratedColumn('uuid')
  maintenance_id: string;

  @Column({ type: 'uuid' })
  asset_id: string;

  @ManyToOne(() => Asset, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'date' })
  scheduled_date: Date;

  @Column({ type: 'date', nullable: true })
  completed_date: Date | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  maintenance_cost: number;

  @Column({ type: 'boolean', default: false })
  sla_breach: boolean;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
