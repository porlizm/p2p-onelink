import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../database/entities/item.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Item)
    private itemRepo: Repository<Item>,
  ) {}

  async getCatalogItems() {
    const today = new Date();

    // Query active items and join their prices and vendors
    const items = await this.itemRepo.find({
      where: {
        status: 'Active',
      },
      relations: ['prices', 'prices.vendor'],
    });

    // Filter active prices that are currently within the effective range
    return items.map((item) => {
      const activePrice = item.prices?.find((p) => {
        const effective = p.effective_date ? new Date(p.effective_date) : null;
        const expiry = p.expiry_date ? new Date(p.expiry_date) : null;
        return (
          p.status === 'Active' &&
          (!effective || effective <= today) &&
          (!expiry || expiry >= today)
        );
      });

      return {
        item_id: item.item_id,
        central_item_code: item.central_item_code,
        item_name: item.item_name,
        item_type: item.item_type,
        uom: item.uom,
        status: item.status,
        price: activePrice
          ? {
              price_id: activePrice.price_id,
              unit_price: Number(activePrice.unit_price),
              vendor_id: activePrice.vendor_id,
              vendor_name: activePrice.vendor?.vendor_name || 'N/A',
            }
          : null,
      };
    });
  }
}
