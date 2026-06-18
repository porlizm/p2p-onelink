import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';
import { ScopeAssignment } from './scope-assignment.entity';

@Entity('app_user')
export class AppUser {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, default: 'Local' })
  login_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash: string;

  @Column({ type: 'varchar', length: 50, default: 'Active' })
  status: string;

  @Column({ type: 'boolean', default: false })
  mfa_enabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @Column({ type: 'int', default: 30 })
  session_timeout_minutes: number;

  @OneToMany(() => UserRole, (ur) => ur.user)
  user_roles: UserRole[];

  @OneToMany(() => ScopeAssignment, (scope) => scope.user)
  scopes: ScopeAssignment[];
}
