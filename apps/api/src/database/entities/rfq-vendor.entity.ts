import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BiddingEvent } from './bidding-event.entity';
import { Vendor } from './vendor.entity';

@Entity('rfq_vendor')
export class RfqVendor {
  @PrimaryGeneratedColumn('uuid')
  rfq_vendor_id: string;

  @Column({ type: 'uuid' })
  rfq_id: string;

  @ManyToOne(() => BiddingEvent, (rfq) => rfq.vendors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfq_id' })
  rfq: BiddingEvent;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;
}
