import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { EvaluationTemplateService } from './evaluation-template.service';

@Controller('evaluation-template')
export class EvaluationTemplateController {
  constructor(private readonly service: EvaluationTemplateService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  async create(
    @Body() body: {
      name: string;
      applies_to: string;
      category?: string;
      vendor_type?: string;
      criteria: { key: string; label: string; weight: number }[];
    },
  ) {
    return this.service.create(body);
  }

  @Patch(':id/version')
  async createNewVersion(
    @Param('id') id: string,
    @Body('criteria') criteria: { key: string; label: string; weight: number }[],
  ) {
    return this.service.createNewVersion(id, criteria);
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string) {
    return this.service.archive(id);
  }
}
