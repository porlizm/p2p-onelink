import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApprovalDecision } from '@p2p/shared';

export class DecideTaskDto {
  @IsEnum(ApprovalDecision)
  decision: ApprovalDecision;

  @IsOptional()
  @IsString()
  reason?: string;
}
