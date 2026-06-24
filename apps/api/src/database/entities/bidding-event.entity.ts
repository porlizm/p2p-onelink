import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { BiddingStatus } from '@p2p/shared';
import { RfqItem } from './rfq-item.entity';
import { RfqVendor } from './rfq-vendor.entity';
import { BidQuotation } from './bid-quotation.entity';

@Entity('bidding_event')
export class BiddingEvent {
  @PrimaryGeneratedColumn('uuid')
  rfq_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  rfq_no: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: BiddingStatus.DRAFT,
  })
  status: BiddingStatus;

  @Column({ type: 'varchar', length: 50, default: 'RFQ_Closed' })
  bid_type: string;

  @Column({ type: 'int', default: 1 })
  round_no: number;

  @Column({ type: 'int', default: 0 })
  technical_weight: number;

  @Column({ type: 'int', default: 100 })
  commercial_weight: number;

  @Column({ type: 'int', default: 72 })
  response_deadline_hrs: number;

  @Column({ type: 'timestamp', nullable: true })
  awarded_at: Date | null;

  @Column({ type: 'uuid', nullable: true })
  winner_quote_id: string | null;

  @Column({ type: 'boolean', default: false })
  is_escalated: boolean;

  @Column({ type: 'timestamp' })
  close_date: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => RfqItem, (item) => item.rfq, { cascade: true })
  items: RfqItem[];

  @OneToMany(() => RfqVendor, (vendor) => vendor.rfq, { cascade: true })
  vendors: RfqVendor[];

  @OneToMany(() => BidQuotation, (quote) => quote.rfq)
  quotations: BidQuotation[];
}
