import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationTemplate } from '../database/entities/evaluation-template.entity';
import { EvaluationTemplateController } from './evaluation-template.controller';
import { EvaluationTemplateService } from './evaluation-template.service';

@Module({
  imports: [TypeOrmModule.forFeature([EvaluationTemplate])],
  controllers: [EvaluationTemplateController],
  providers: [EvaluationTemplateService],
})
export class EvaluationTemplateModule {}
