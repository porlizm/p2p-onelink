import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetRentalLog } from '../database/entities/asset-rental-log.entity';
import { LicenseSubscription } from '../database/entities/license-subscription.entity';
import { BusinessUnit } from '../database/entities/business-unit.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('catalog/asset-rentals')
@UseGuards(JwtAuthGuard)
export class AssetRentalController {
  constructor(
    @InjectRepository(AssetRentalLog)
    private readonly rentalRepo: Repository<AssetRentalLog>,
    @InjectRepository(LicenseSubscription)
    private readonly licenseRepo: Repository<LicenseSubscription>,
    @InjectRepository(BusinessUnit)
    private readonly buRepo: Repository<BusinessUnit>,
  ) {}

  @Get('rentals')
  async getRentals() {
    return this.rentalRepo.find({
      relations: ['owner_bu', 'rented_to_bu', 'po'],
      order: { created_at: 'DESC' },
    });
  }

  @Get('licenses')
  async getLicenses() {
    return this.licenseRepo.find({
      relations: ['vendor', 'po'],
      order: { created_at: 'DESC' },
    });
  }

  @Post('rentals')
  async createRentalLog(
    @Body() body: {
      item_name: string;
      asset_tag?: string;
      owner_bu_id: string;
      rented_to_bu_id: string;
      owner_name?: string;
      renter_name?: string;
      start_date?: string;
      end_date?: string;
    },
  ) {
    if (!body.item_name || !body.owner_bu_id || !body.rented_to_bu_id) {
      throw new BadRequestException('กรุณากรอกข้อมูลชื่อสินทรัพย์, BU เจ้าของ, และ BU ผู้เช่า');
    }

    const ownerBu = await this.buRepo.findOne({ where: { bu_id: body.owner_bu_id } });
    const renterBu = await this.buRepo.findOne({ where: { bu_id: body.rented_to_bu_id } });
    if (!ownerBu || !renterBu) {
      throw new BadRequestException('ไม่พบ BU เจ้าของ หรือ BU ผู้เช่าที่ระบุ');
    }

    const log = this.rentalRepo.create({
      item_name: body.item_name,
      asset_tag: body.asset_tag || `AST-${Date.now().toString().slice(-6)}`,
      owner_bu_id: body.owner_bu_id,
      rented_to_bu_id: body.rented_to_bu_id,
      owner_name: body.owner_name || '',
      renter_name: body.renter_name || '',
      start_date: body.start_date ? new Date(body.start_date) : new Date(),
      end_date: body.end_date ? new Date(body.end_date) : new Date(Date.now() + 86400000 * 365),
      status: 'Active',
    });

    return this.rentalRepo.save(log);
  }
}
