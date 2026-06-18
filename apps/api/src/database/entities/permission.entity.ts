import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('permission')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  permission_id: string;

  @Column({ type: 'varchar', length: 100 })
  permission_code: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @ManyToOne(() => Role, (role) => role.permissions)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
