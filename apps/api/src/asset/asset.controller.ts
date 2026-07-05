import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { DistributeAssetDto } from './dto/distribute-asset.dto';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  async findAll() {
    return await this.assetService.findAll();
  }

  @Get('dashboard/stats')
  async getDashboardStats() {
    return await this.assetService.getDashboardStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.assetService.findOne(id);
  }

  @Post()
  async createAsset(@Body() dto: CreateAssetDto) {
    return await this.assetService.createAsset(dto);
  }

  @Post(':id/allocate')
  async allocateAsset(@Param('id') id: string, @Body() dto: DistributeAssetDto) {
    return await this.assetService.allocateAsset(id, dto);
  }

  @Post(':id/dispose')
  async disposeAsset(
    @Param('id') id: string,
    @Body() dto: { disposal_type: 'Sold' | 'Scrapped'; reason: string; amount?: number },
  ) {
    return await this.assetService.disposeAsset(id, dto);
  }

  @Post(':id/transfer')
  async transferAsset(@Param('id') id: string, @Body() dto: { to_bu_id: string; reason?: string }) {
    return await this.assetService.transferAsset(id, dto);
  }
}
