import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('lane')
export class Lane {
  @PrimaryGeneratedColumn('uuid')
  lane_id: string;

  @Column({ type: 'varchar', length: 100 })
  lane_name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  lane_code: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
