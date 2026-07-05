import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrLineDto {
  @IsString()
  @IsOptional()
  item_id?: string;

  @IsString()
  @IsNotEmpty()
  item_name: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  uom: string;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsString()
  @IsNotEmpty()
  cost_center_id: string;

  @IsString()
  @IsOptional()
  quotation_url?: string;

  @IsOptional()
  is_requirement_based?: boolean;

  @IsString()
  @IsOptional()
  scope_of_work?: string;
}

export class CreatePrDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  contract_id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrLineDto)
  lines: CreatePrLineDto[];
}
