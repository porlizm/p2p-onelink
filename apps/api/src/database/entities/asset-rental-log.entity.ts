import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessUnit } from './business-unit.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('asset_rental_log')
export class AssetRentalLog {
  @PrimaryGeneratedColumn('uuid')
  log_id: string;

  @Column({ type: 'varchar', length: 255 })
  item_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  asset_tag: string;

  @Column({ type: 'uuid' })
  owner_bu_id: string;

  @ManyToOne(() => BusinessUnit)
  @JoinColumn({ name: 'owner_bu_id' })
  owner_bu: BusinessUnit;

  @Column({ type: 'uuid' })
  rented_to_bu_id: string;

  @ManyToOne(() => BusinessUnit)
  @JoinColumn({ name: 'rented_to_bu_id' })
  rented_to_bu: BusinessUnit;

  @Column({ type: 'varchar', length: 100, nullable: true })
  owner_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  renter_name: string;

  @Column({ type: 'uuid', nullable: true })
  po_id: string;

  @ManyToOne(() => PurchaseOrder, { nullable: true })
  @JoinColumn({ name: 'po_id' })
  po: PurchaseOrder;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({ type: 'varchar', length: 50, default: 'Active' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
