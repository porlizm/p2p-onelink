import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Vendor } from './vendor.entity';
import { CostCenter } from './cost-center.entity';
import { AppUser } from './app-user.entity';
import { Lane } from './lane.entity';
import { PaymentProposal } from './payment-proposal.entity';

@Entity('payment_request')
export class PaymentRequest {
  @PrimaryGeneratedColumn('uuid')
  payment_request_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  payment_request_no: string;

  @Column({ type: 'uuid' })
  invoice_id: string;

  @ManyToOne(() => Invoice)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'uuid' })
  cost_center_id: string;

  @ManyToOne(() => CostCenter)
  @JoinColumn({ name: 'cost_center_id' })
  costCenter: CostCenter;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'varchar', length: 50, default: 'Maker' }) // Maker, Verify, ApproveVerify, Confirm, FinanceVerify, Paid, BlockedOverBudget
  status: string;

  @Column({ type: 'uuid', nullable: true })
  lane_id: string;

  @ManyToOne(() => Lane)
  @JoinColumn({ name: 'lane_id' })
  lane: Lane;

  @Column({ type: 'uuid', nullable: true })
  proposal_id: string;

  @ManyToOne(() => PaymentProposal)
  @JoinColumn({ name: 'proposal_id' })
  proposal: PaymentProposal;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alternative_payee_name: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alternative_payee_bank: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  alternative_payee_account: string | null;

  @Column({ type: 'varchar', length: 10, default: 'THB' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1.0 })
  fx_rate: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  swift_code: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  intermediary_bank_details: string | null;

  @Column({ type: 'uuid' })
  created_by: string;

  @ManyToOne(() => AppUser)
  @JoinColumn({ name: 'created_by' })
  creator: AppUser;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
