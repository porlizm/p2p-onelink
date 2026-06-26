import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { DistributeAssetDto } from './dto/distribute-asset.dto';

@Controller('api/asset')
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
}
