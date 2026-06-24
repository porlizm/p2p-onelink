import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { ItemTypeController } from './item-type.controller';
import { AssetRentalController } from './asset-rental.controller';
import { Item } from '../database/entities/item.entity';
import { ProcurementItemType } from '../database/entities/procurement-item-type.entity';
import { AssetRentalLog } from '../database/entities/asset-rental-log.entity';
import { LicenseSubscription } from '../database/entities/license-subscription.entity';
import { BusinessUnit } from '../database/entities/business-unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Item,
      ProcurementItemType,
      AssetRentalLog,
      LicenseSubscription,
      BusinessUnit,
    ]),
  ],
  providers: [CatalogService],
  controllers: [CatalogController, ItemTypeController, AssetRentalController],
  exports: [CatalogService],
})
export class CatalogModule {}
