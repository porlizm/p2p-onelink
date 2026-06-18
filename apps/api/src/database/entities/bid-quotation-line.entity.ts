import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BidQuotation } from './bid-quotation.entity';
import { RfqItem } from './rfq-item.entity';

@Entity('bid_quotation_line')
export class BidQuotationLine {
  @PrimaryGeneratedColumn('uuid')
  quote_line_id: string;

  @Column({ type: 'uuid' })
  quote_id: string;

  @ManyToOne(() => BidQuotation, (quote) => quote.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quote_id' })
  quotation: BidQuotation;

  @Column({ type: 'uuid' })
  rfq_item_id: string;

  @ManyToOne(() => RfqItem)
  @JoinColumn({ name: 'rfq_item_id' })
  rfq_item: RfqItem;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_price: number;

  @Column({ type: 'int' })
  delivery_days: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  quotation_url: string | null;
}
