import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PurchaseContract } from './purchase-contract.entity';

@Entity('contract_milestone')
export class ContractMilestone {
  @PrimaryGeneratedColumn('uuid')
  milestone_id: string;

  @Column({ type: 'uuid' })
  contract_id: string;

  @ManyToOne(() => PurchaseContract, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: PurchaseContract;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'varchar', length: 50, default: 'Pending' }) // 'Pending', 'Delivered', 'Delayed'
  status: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
