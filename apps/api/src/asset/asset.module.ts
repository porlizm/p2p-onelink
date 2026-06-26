import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { Asset } from '../database/entities/asset.entity';
import { AssetAllocation } from '../database/entities/asset-allocation.entity';
import { BusinessUnit } from '../database/entities/business-unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, AssetAllocation, BusinessUnit]),
  ],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetModule {}
