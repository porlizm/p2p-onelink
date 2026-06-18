import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { AppUser } from './app-user.entity';
import { Company } from './company.entity';
import { PurchaseRequisitionLine } from './purchase-requisition-line.entity';
import { PurchaseRequisitionStatus } from '@p2p/shared';

@Entity('purchase_requisition')
export class PurchaseRequisition {
  @PrimaryGeneratedColumn('uuid')
  pr_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  pr_no: string;

  @Column({ type: 'uuid' })
  requester_id: string;

  @ManyToOne(() => AppUser)
  @JoinColumn({ name: 'requester_id' })
  requester: AppUser;

  @Column({ type: 'uuid' })
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({
    type: 'varchar',
    length: 50,
    default: PurchaseRequisitionStatus.DRAFT,
  })
  status: PurchaseRequisitionStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => PurchaseRequisitionLine, (line) => line.pr, { cascade: true })
  lines: PurchaseRequisitionLine[];
}
