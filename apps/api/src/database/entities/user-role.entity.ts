import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppUser } from './app-user.entity';
import { Role } from './role.entity';
import { Company } from './company.entity';
import { BusinessUnit } from './business-unit.entity';

@Entity('user_role')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  user_role_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => AppUser, (user) => user.user_roles)
  @JoinColumn({ name: 'user_id' })
  user: AppUser;

  @Column({ type: 'uuid' })
  role_id: string;

  @ManyToOne(() => Role, (role) => role.user_roles)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'uuid', nullable: true })
  company_id: string;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', nullable: true })
  bu_id: string;

  @ManyToOne(() => BusinessUnit, { nullable: true })
  @JoinColumn({ name: 'bu_id' })
  business_unit: BusinessUnit;
}
