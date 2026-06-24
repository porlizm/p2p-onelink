import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_attachment')
export class InvoiceAttachment {
  @PrimaryGeneratedColumn('uuid')
  attachment_id: string;

  @Column({ type: 'uuid' })
  invoice_id: string;

  @ManyToOne(() => Invoice, (inv) => inv.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'varchar', length: 255 })
  file_url: string;

  @Column({ type: 'varchar', length: 100 })
  document_type: string;
}
