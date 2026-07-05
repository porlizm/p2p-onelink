import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { AppUser } from './app-user.entity';
import { GoodsReceiptLine } from './gr-line.entity';
import { GoodsReceiptAttachment } from './gr-attachment.entity';
import { GoodsReceiptStatus } from '@p2p/shared';

@Entity('goods_receipt')
export class GoodsReceipt {
  @PrimaryGeneratedColumn('uuid')
  gr_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  gr_no: string;

  @Column({ type: 'uuid', nullable: true })
  po_id: string | null;

  @ManyToOne(() => PurchaseOrder, { nullable: true })
  @JoinColumn({ name: 'po_id' })
  po: PurchaseOrder | null;

  @Column({ type: 'boolean', default: false })
  pending_match: boolean;

  @Column({ type: 'varchar', length: 50 })
  receive_type: string;

  @Column({ type: 'timestamp' })
  receive_date: Date;

  @Column({ type: 'boolean', default: false })
  partial_flag: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  quality_score: number;

  @Column({ type: 'uuid' })
  received_by: string;

  @ManyToOne(() => AppUser)
  @JoinColumn({ name: 'received_by' })
  receiver: AppUser;

  @Column({
    type: 'varchar',
    length: 50,
    default: GoodsReceiptStatus.PENDING_RECEIPT,
  })
  status: GoodsReceiptStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => GoodsReceiptLine, (line) => line.gr, { cascade: true })
  lines: GoodsReceiptLine[];

  @OneToMany(() => GoodsReceiptAttachment, (att) => att.gr, { cascade: true })
  attachments: GoodsReceiptAttachment[];
}
