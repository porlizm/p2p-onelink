import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ItemCompanyMapping } from './item-company-mapping.entity';
import { ItemPrice } from './item-price.entity';

@Entity('item')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  item_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  central_item_code: string;

  @Column({ type: 'varchar', length: 255 })
  item_name: string;

  @Column({ type: 'varchar', length: 50 })
  item_type: string;

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ type: 'varchar', length: 50 })
  uom: string;

  @Column({ type: 'uuid', nullable: true })
  owner_bu_id: string;

  @Column({ type: 'varchar', length: 50, default: 'Active' })
  status: string;

  @OneToMany(() => ItemCompanyMapping, (mapping) => mapping.item)
  company_mappings: ItemCompanyMapping[];

  @OneToMany(() => ItemPrice, (price) => price.item)
  prices: ItemPrice[];
}
