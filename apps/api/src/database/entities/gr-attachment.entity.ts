import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GoodsReceipt } from './goods-receipt.entity';

@Entity('gr_attachment')
export class GoodsReceiptAttachment {
  @PrimaryGeneratedColumn('uuid')
  attachment_id: string;

  @Column({ type: 'uuid' })
  gr_id: string;

  @ManyToOne(() => GoodsReceipt, (gr) => gr.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gr_id' })
  gr: GoodsReceipt;

  @Column({ type: 'varchar', length: 255 })
  file_url: string;

  @Column({ type: 'varchar', length: 50 })
  file_type: string;
}
