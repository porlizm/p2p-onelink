import { Controller, Get, Post, Delete, Body, Param, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementItemType } from '../database/entities/procurement-item-type.entity';
import { Item } from '../database/entities/item.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('catalog/item-types')
@UseGuards(JwtAuthGuard)
export class ItemTypeController {
  constructor(
    @InjectRepository(ProcurementItemType)
    private readonly typeRepo: Repository<ProcurementItemType>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  @Get()
  async getTypes() {
    return this.typeRepo.find({ order: { created_at: 'ASC' } });
  }

  @Post()
  async createType(
    @Body() body: { type_code: string; type_name: string; description?: string },
  ) {
    if (!body.type_code || !body.type_name) {
      throw new BadRequestException('รหัสประเภทและชื่อประเภทห้ามเป็นค่าว่าง');
    }

    const codeUpper = body.type_code.trim();
    
    // Check if exists
    const exists = await this.typeRepo.findOne({ where: { type_code: codeUpper } });
    if (exists) {
      throw new BadRequestException(`รหัสประเภท "${codeUpper}" มีอยู่ในระบบแล้ว`);
    }

    const newType = this.typeRepo.create({
      type_code: codeUpper,
      type_name: body.type_name.trim(),
      description: body.description || '',
      is_system_default: false,
    });

    return this.typeRepo.save(newType);
  }

  @Delete(':id')
  async deleteType(@Param('id') id: string) {
    const itemType = await this.typeRepo.findOne({ where: { type_id: id } });
    if (!itemType) {
      throw new NotFoundException('ไม่พบประเภทที่ระบุ');
    }

    if (itemType.is_system_default) {
      throw new BadRequestException('ไม่สามารถลบประเภทที่เป็นของระบบเริ่มต้นได้ (System Default)');
    }

    // Check if any items are using this type
    const count = await this.itemRepo.count({ where: { item_type: itemType.type_code } });
    if (count > 0) {
      throw new BadRequestException(`ไม่สามารถลบประเภทนี้ได้ เนื่องจากมีสินค้าจำนวน ${count} รายการใช้งานอยู่`);
    }

    await this.typeRepo.remove(itemType);
    return { success: true };
  }
}
