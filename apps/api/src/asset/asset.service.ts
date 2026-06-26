import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Asset } from '../database/entities/asset.entity';
import { AssetAllocation } from '../database/entities/asset-allocation.entity';
import { BusinessUnit } from '../database/entities/business-unit.entity';
import { CreateAssetDto } from './dto/create-asset.dto';
import { DistributeAssetDto } from './dto/distribute-asset.dto';

@Injectable()
export class AssetService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Asset)
    private assetRepo: Repository<Asset>,
    @InjectRepository(AssetAllocation)
    private allocationRepo: Repository<AssetAllocation>,
    @InjectRepository(BusinessUnit)
    private buRepo: Repository<BusinessUnit>,
  ) {}

  async onModuleInit() {
    // Auto-seed mock assets when service starts if table is empty
    await this.seedMockAssets();
  }

  async findAll(): Promise<Asset[]> {
    return await this.assetRepo.find({
      relations: ['owner_bu', 'item', 'po'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(assetId: string) {
    const asset = await this.assetRepo.findOne({
      where: { asset_id: assetId },
      relations: ['owner_bu', 'item', 'po'],
    });
    if (!asset) {
      throw new NotFoundException('ไม่พบสินทรัพย์ที่ระบุ');
    }

    const allocations = await this.allocationRepo.find({
      where: { asset_id: assetId },
      relations: ['to_bu'],
      order: { created_at: 'DESC' },
    });

    return {
      ...asset,
      allocations,
    };
  }

  async createAsset(dto: CreateAssetDto): Promise<Asset> {
    const now = new Date();
    const yyyy = now.getFullYear();
    const prefix = `AST-${yyyy}-`;
    const count = await this.assetRepo.count({
      where: { asset_tag: Like(`${prefix}%`) },
    });
    const tag = `${prefix}${(count + 1).toString().padStart(4, '0')}`;

    const asset = this.assetRepo.create({
      asset_tag: tag,
      asset_name: dto.asset_name,
      asset_type: dto.asset_type,
      item_id: dto.item_id || null,
      unit_price: dto.unit_price,
      total_qty: dto.total_qty,
      distributed_qty: 0,
      remaining_qty: dto.total_qty,
      owner_bu_id: dto.owner_bu_id,
      acquisition_date: dto.acquisition_date ? new Date(dto.acquisition_date) : new Date(),
      license_key: dto.license_key || null,
      expiry_date: dto.expiry_date ? new Date(dto.expiry_date) : null,
      po_id: dto.po_id || null,
      status: 'In Stock',
    });

    return await this.assetRepo.save(asset);
  }

  async allocateAsset(assetId: string, dto: DistributeAssetDto): Promise<AssetAllocation> {
    return await this.dataSource.transaction(async (manager) => {
      const asset = await manager.getRepository(Asset).findOne({
        where: { asset_id: assetId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!asset) {
        throw new NotFoundException('ไม่พบสินทรัพย์ที่ระบุ');
      }

      const allocatedQty = Math.round(Number(dto.allocated_qty));
      if (allocatedQty <= 0) {
        throw new BadRequestException('จำนวนที่จะจัดสรรต้องมากกว่า 0');
      }

      if (allocatedQty > asset.remaining_qty) {
        throw new BadRequestException(
          `ไม่สามารถจัดสรรได้ เนื่องจากมีจำนวนคงเหลือไม่เพียงพอ (คงเหลือ: ${asset.remaining_qty} เครื่อง/หน่วย)`
        );
      }

      // Update asset quantity fields
      asset.remaining_qty = Number(asset.remaining_qty) - allocatedQty;
      asset.distributed_qty = Number(asset.distributed_qty) + allocatedQty;
      
      if (asset.remaining_qty === 0) {
        asset.status = dto.allocation_type === 'Rental' ? 'Rented' : 'Distributed';
      } else {
        asset.status = 'Distributed';
      }
      await manager.getRepository(Asset).save(asset);

      // Save allocation record
      const allocation = manager.getRepository(AssetAllocation).create({
        asset_id: asset.asset_id,
        to_bu_id: dto.to_bu_id,
        allocated_qty: allocatedQty,
        allocation_type: dto.allocation_type,
        rental_rate: dto.rental_rate || 0,
        start_date: dto.start_date ? new Date(dto.start_date) : new Date(),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        status: 'Active',
      });

      return await manager.getRepository(AssetAllocation).save(allocation);
    });
  }

  async getDashboardStats() {
    const assets = await this.assetRepo.find();
    const allocations = await this.allocationRepo.find({
      relations: ['to_bu'],
    });

    const totalAssets = assets.length;
    let totalVal = 0;
    let totalLicenseSeats = 0;

    assets.forEach((a) => {
      totalVal += Number(a.unit_price) * Number(a.total_qty);
      if (a.asset_type === 'License') {
        totalLicenseSeats += Number(a.total_qty);
      }
    });

    const activeRentals = allocations
      .filter((al) => al.allocation_type === 'Rental' && al.status === 'Active')
      .reduce((sum, al) => sum + Number(al.allocated_qty), 0);

    // Distribution details by BU
    const buMap: { [buName: string]: number } = {};
    allocations.forEach((al) => {
      if (al.status === 'Active' && al.to_bu) {
        buMap[al.to_bu.bu_name] = (buMap[al.to_bu.bu_name] || 0) + Number(al.allocated_qty);
      }
    });

    const distributionChart = Object.keys(buMap).map((key) => ({
      buName: key,
      allocatedQty: buMap[key],
    }));

    return {
      totalAssets,
      totalVal,
      totalLicenseSeats,
      activeRentals,
      distributionChart,
    };
  }

  private async seedMockAssets() {
    const count = await this.assetRepo.count();
    if (count > 0) return;

    console.log('Seeding mock asset data...');
    // Fetch a business unit for owning (IT BU uuid(2,2))
    const itBuId = '00000002-0000-0000-0000-000000000002';
    const itBuExists = await this.buRepo.findOne({ where: { bu_id: itBuId } });
    if (!itBuExists) return;

    // 1. Create Lenovo ThinkPad Laptop Asset
    const laptopAsset = this.assetRepo.create({
      asset_tag: 'AST-2026-0001',
      asset_name: 'โน้ตบุ๊ค Lenovo ThinkPad L14 Gen 4',
      asset_type: 'Goods',
      unit_price: 35000,
      total_qty: 100,
      distributed_qty: 90,
      remaining_qty: 10,
      owner_bu_id: itBuId,
      acquisition_date: new Date(Date.now() - 86400000 * 30), // 30 days ago
      status: 'Distributed',
    });
    const savedLaptop = await this.assetRepo.save(laptopAsset);

    // Seed allocations for laptops
    const allocationsData = [
      { buId: '00000002-0000-0000-0000-000000000001', qty: 20 }, // PROC
      { buId: '00000002-0000-0000-0000-000000000003', qty: 20 }, // WH
      { buId: '00000002-0000-0000-0000-000000000005', qty: 20 }, // B2C
      { buId: '00000002-0000-0000-0000-000000000004', qty: 30 }, // FIN (sub-company proxy)
    ];

    for (const alloc of allocationsData) {
      const a = this.allocationRepo.create({
        asset_id: savedLaptop.asset_id,
        to_bu_id: alloc.buId,
        allocated_qty: alloc.qty,
        allocation_type: 'Rental',
        rental_rate: 500, // 500 THB/month
        start_date: new Date(Date.now() - 86400000 * 30),
        end_date: new Date(Date.now() + 86400000 * 335),
        status: 'Active',
      });
      await this.allocationRepo.save(a);
    }

    // 2. Create Software License Asset (Microsoft 365)
    const m365Asset = this.assetRepo.create({
      asset_tag: 'AST-2026-0002',
      asset_name: 'Microsoft 365 Business Standard (Cloud License)',
      asset_type: 'License',
      unit_price: 450,
      total_qty: 150,
      distributed_qty: 0,
      remaining_qty: 150,
      owner_bu_id: itBuId,
      acquisition_date: new Date(Date.now() - 86400000 * 15),
      license_key: 'M365-STD-150SEATS-JWD2026',
      expiry_date: new Date(Date.now() + 86400000 * 350),
      status: 'In Stock',
    });
    await this.assetRepo.save(m365Asset);

    // 3. Create Cloud Hosting Service Asset (AWS Enterprise)
    const cloudAsset = this.assetRepo.create({
      asset_tag: 'AST-2026-0003',
      asset_name: 'บริการระบบคลาวด์ AWS Enterprise Cloud Infrastructure',
      asset_type: 'Service',
      unit_price: 120000,
      total_qty: 1,
      distributed_qty: 0,
      remaining_qty: 1,
      owner_bu_id: itBuId,
      acquisition_date: new Date(Date.now() - 86400000 * 45),
      expiry_date: new Date(Date.now() + 86400000 * 320),
      status: 'In Stock',
    });
    await this.assetRepo.save(cloudAsset);

    console.log('Seeded mock assets successfully!');
  }
}
