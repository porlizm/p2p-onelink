import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from './item.entity';
import { Company } from './company.entity';

@Entity('item_company_mapping')
export class ItemCompanyMapping {
  @PrimaryGeneratedColumn('uuid')
  mapping_id: string;

  @Column({ type: 'uuid' })
  item_id: string;

  @ManyToOne(() => Item, (item) => item.company_mappings)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'uuid' })
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sap_item_code: string;

  @Column({ type: 'boolean', default: true })
  is_active_in_company: boolean;
}
