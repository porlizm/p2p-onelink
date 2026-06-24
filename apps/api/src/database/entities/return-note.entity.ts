import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Claim } from './claim.entity';
import { GoodsReceipt } from './goods-receipt.entity';
import { ReturnNoteStatus } from '@p2p/shared';

@Entity('return_note')
export class ReturnNote {
  @PrimaryGeneratedColumn('uuid')
  return_id: string;

  @Column({ type: 'uuid' })
  claim_id: string;

  @ManyToOne(() => Claim, (claim) => claim.returns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claim_id' })
  claim: Claim;

  @Column({ type: 'uuid' })
  gr_id: string;

  @ManyToOne(() => GoodsReceipt)
  @JoinColumn({ name: 'gr_id' })
  gr: GoodsReceipt;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  return_qty: number;

  @Column({ type: 'varchar', length: 255 })
  return_reason: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: ReturnNoteStatus.PENDING,
  })
  status: ReturnNoteStatus;
}
