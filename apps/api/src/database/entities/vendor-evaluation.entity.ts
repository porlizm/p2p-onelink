import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { AppUser } from './app-user.entity';

@Entity('vendor_evaluation')
export class VendorEvaluation {
  @PrimaryGeneratedColumn('uuid')
  evaluation_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'jsonb', nullable: true })
  scores: any;

  @Column({ type: 'varchar', length: 50, default: 'Draft' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  approver_id: string | null;

  @ManyToOne(() => AppUser)
  @JoinColumn({ name: 'approver_id' })
  approver: AppUser;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
