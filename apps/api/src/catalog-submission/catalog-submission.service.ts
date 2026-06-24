import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorCatalogSubmission } from '../database/entities/vendor-catalog-submission.entity';
import { Item } from '../database/entities/item.entity';
import { ItemPrice } from '../database/entities/item-price.entity';
import { Vendor } from '../database/entities/vendor.entity';

@Injectable()
export class CatalogSubmissionService {
  constructor(
    @InjectRepository(VendorCatalogSubmission)
    private readonly submissionRepo: Repository<VendorCatalogSubmission>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(ItemPrice)
    private readonly priceRepo: Repository<ItemPrice>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  async uploadCatalog(
    vendorId: string,
    items: Array<{
      item_name: string;
      item_type: string;
      uom: string;
      unit_price: number;
    }>,
  ) {
    const vendor = await this.vendorRepo.findOne({ where: { vendor_id: vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const submission = this.submissionRepo.create({
      vendor_id: vendorId,
      items,
      status: 'PendingApproval',
    });

    return this.submissionRepo.save(submission);
  }

  async getSubmissions() {
    return this.submissionRepo.find({
      relations: ['vendor'],
      order: { created_at: 'DESC' },
    });
  }

  async reviewSubmission(id: string, action: 'Approved' | 'Rejected', userId: string) {
    const submission = await this.submissionRepo.findOne({ where: { submission_id: id } });
    if (!submission) throw new NotFoundException('Submission not found');

    if (submission.status !== 'PendingApproval') {
      throw new BadRequestException('Submission has already been reviewed');
    }

    submission.status = action;
    submission.reviewed_by = userId;
    const saved = await this.submissionRepo.save(submission);

    if (action === 'Approved') {
      // Create actual catalog items
      for (const itemData of submission.items) {
        const itemCode = `ITM-2026-${Math.floor(Math.random() * 90000) + 10000}`;
        const newItem = this.itemRepo.create({
          central_item_code: itemCode,
          item_name: itemData.item_name,
          item_type: itemData.item_type || 'ผู้ขาย',
          uom: itemData.uom || 'Pcs',
          status: 'Active',
        });
        const savedItem = await this.itemRepo.save(newItem);

        // Add pricing record
        const price = this.priceRepo.create({
          item_id: savedItem.item_id,
          vendor_id: submission.vendor_id,
          unit_price: itemData.unit_price,
          status: 'Active',
          effective_date: new Date(),
          expiry_date: new Date(Date.now() + 86400000 * 365), // 1 year expiry
        });
        await this.priceRepo.save(price);
      }
    }

    return saved;
  }
}
