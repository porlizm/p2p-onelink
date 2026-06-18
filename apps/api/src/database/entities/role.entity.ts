import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';
import { Permission } from './permission.entity';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  role_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  role_name: string;

  @OneToMany(() => UserRole, (ur) => ur.role)
  user_roles: UserRole[];

  @OneToMany(() => Permission, (perm) => perm.role)
  permissions: Permission[];
}
