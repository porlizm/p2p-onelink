import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationTemplate } from '../database/entities/evaluation-template.entity';

@Injectable()
export class EvaluationTemplateService {
  constructor(
    @InjectRepository(EvaluationTemplate)
    private readonly repo: Repository<EvaluationTemplate>,
  ) {}

  async findAll() {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async create(body: {
    name: string;
    applies_to: string;
    category?: string;
    vendor_type?: string;
    criteria: { key: string; label: string; weight: number }[];
  }) {
    const totalWeight = body.criteria.reduce((sum, c) => sum + Number(c.weight), 0);
    if (totalWeight !== 100) {
      throw new BadRequestException(`น้ำหนักคะแนนรวมต้องเท่ากับ 100 (ปัจจุบันรวม ${totalWeight})`);
    }

    const template = this.repo.create({
      name: body.name,
      applies_to: body.applies_to,
      category: body.category || null,
      vendor_type: body.vendor_type || null,
      criteria: body.criteria,
      version_no: 1,
      status: 'Active',
    });
    return this.repo.save(template);
  }

  async createNewVersion(templateId: string, criteria: { key: string; label: string; weight: number }[]) {
    const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight), 0);
    if (totalWeight !== 100) {
      throw new BadRequestException(`น้ำหนักคะแนนรวมต้องเท่ากับ 100 (ปัจจุบันรวม ${totalWeight})`);
    }
    const existing = await this.repo.findOne({ where: { template_id: templateId } });
    if (!existing) throw new NotFoundException('ไม่พบ Evaluation Template');

    existing.criteria = criteria;
    existing.version_no += 1;
    return this.repo.save(existing);
  }

  async archive(templateId: string) {
    const existing = await this.repo.findOne({ where: { template_id: templateId } });
    if (!existing) throw new NotFoundException('ไม่พบ Evaluation Template');
    existing.status = 'Archived';
    return this.repo.save(existing);
  }
}
