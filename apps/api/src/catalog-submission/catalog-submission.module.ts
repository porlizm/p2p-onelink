import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorCatalogSubmission } from '../database/entities/vendor-catalog-submission.entity';
import { Item } from '../database/entities/item.entity';
import { ItemPrice } from '../database/entities/item-price.entity';
import { Vendor } from '../database/entities/vendor.entity';
import { CatalogSubmissionController } from './catalog-submission.controller';
import { CatalogSubmissionService } from './catalog-submission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VendorCatalogSubmission, Item, ItemPrice, Vendor]),
  ],
  controllers: [CatalogSubmissionController],
  providers: [CatalogSubmissionService],
  exports: [CatalogSubmissionService],
})
export class CatalogSubmissionModule {}
