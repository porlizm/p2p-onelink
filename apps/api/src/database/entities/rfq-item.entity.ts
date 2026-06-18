import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BiddingEvent } from './bidding-event.entity';
import { Item } from './item.entity';

@Entity('rfq_item')
export class RfqItem {
  @PrimaryGeneratedColumn('uuid')
  rfq_item_id: string;

  @Column({ type: 'uuid' })
  rfq_id: string;

  @ManyToOne(() => BiddingEvent, (rfq) => rfq.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfq_id' })
  rfq: BiddingEvent;

  @Column({ type: 'uuid', nullable: true })
  item_id: string | null;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'varchar', length: 255 })
  item_name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 50 })
  uom: string;
}
