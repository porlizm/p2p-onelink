import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { GoodsReceipt } from './goods-receipt.entity';
import { AppUser } from './app-user.entity';
import { ReturnNote } from './return-note.entity';
import { ClaimStatus } from '@p2p/shared';

@Entity('claim')
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  claim_id: string;

  @Column({ type: 'uuid' })
  gr_id: string;

  @ManyToOne(() => GoodsReceipt)
  @JoinColumn({ name: 'gr_id' })
  gr: GoodsReceipt;

  @Column({ type: 'varchar', length: 50 })
  claim_type: string; // Claim, Complaint, CorrectiveAction

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid' })
  raised_by: string;

  @ManyToOne(() => AppUser)
  @JoinColumn({ name: 'raised_by' })
  creator: AppUser;

  @Column({
    type: 'varchar',
    length: 50,
    default: ClaimStatus.OPEN,
  })
  status: ClaimStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => ReturnNote, (ret) => ret.claim, { cascade: true })
  returns: ReturnNote[];
}
