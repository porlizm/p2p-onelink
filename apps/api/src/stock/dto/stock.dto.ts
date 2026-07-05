import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  item_id: string;

  @IsString()
  company_id: string;

  @IsString()
  from_warehouse: string;

  @IsString()
  @IsOptional()
  from_location?: string;

  @IsString()
  to_warehouse: string;

  @IsString()
  @IsOptional()
  to_location?: string;

  @IsNumber()
  @Min(0.01)
  qty: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateAdjustmentDto {
  @IsString()
  item_id: string;

  @IsString()
  company_id: string;

  @IsString()
  @IsOptional()
  warehouse?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  counted_qty: number;

  @IsString()
  reason: string;
}

export class CreateWriteOffDto {
  @IsString()
  item_id: string;

  @IsString()
  company_id: string;

  @IsString()
  @IsOptional()
  warehouse?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @Min(0.01)
  qty: number;

  @IsString()
  reason: string;
}

export class CreateCycleCountDto {
  @IsString()
  item_id: string;

  @IsString()
  company_id: string;

  @IsString()
  @IsOptional()
  warehouse?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  counted_qty: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
