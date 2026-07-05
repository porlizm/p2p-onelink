import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity('vendor_message')
export class VendorMessage {
  @PrimaryGeneratedColumn('uuid')
  message_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'varchar', length: 20 })
  sender_role: string; // 'Buyer' | 'Vendor'

  @Column({ type: 'varchar', length: 100 })
  sender_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string | null;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'boolean', default: false })
  read_flag: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
