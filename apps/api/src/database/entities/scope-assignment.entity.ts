import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppUser } from './app-user.entity';

@Entity('scope_assignment')
export class ScopeAssignment {
  @PrimaryGeneratedColumn('uuid')
  scope_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => AppUser, (user) => user.scopes)
  @JoinColumn({ name: 'user_id' })
  user: AppUser;

  @Column({ type: 'varchar', length: 100 })
  scope_type: string;

  @Column({ type: 'varchar', length: 255 })
  scope_value: string;
}
