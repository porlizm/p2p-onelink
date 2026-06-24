import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('payment_proposal')
export class PaymentProposal {
  @PrimaryGeneratedColumn('uuid')
  proposal_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  proposal_no: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_amount: number;

  @Column({ type: 'varchar', length: 50, default: 'Pending' }) // Pending, Approved, Generated
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
