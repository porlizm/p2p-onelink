import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { BiddingEvent } from './bidding-event.entity';
import { Vendor } from './vendor.entity';
import { BidQuotationLine } from './bid-quotation-line.entity';
import { BidQuotationStatus } from '@p2p/shared';

@Entity('bid_quotation')
export class BidQuotation {
  @PrimaryGeneratedColumn('uuid')
  quote_id: string;

  @Column({ type: 'uuid' })
  rfq_id: string;

  @ManyToOne(() => BiddingEvent, (rfq) => rfq.quotations)
  @JoinColumn({ name: 'rfq_id' })
  rfq: BiddingEvent;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({
    type: 'varchar',
    length: 50,
    default: BidQuotationStatus.SUBMITTED,
  })
  status: BidQuotationStatus;

  @CreateDateColumn({ type: 'timestamp' })
  submitted_at: Date;

  @Column({ type: 'int', default: 80 })
  technical_score: number;

  @OneToMany(() => BidQuotationLine, (line) => line.quotation, { cascade: true })
  lines: BidQuotationLine[];
}
