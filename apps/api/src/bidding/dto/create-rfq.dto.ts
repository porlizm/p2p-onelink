import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRfqItemDto {
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
}

export class CreateRfqDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  close_date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRfqItemDto)
  items: CreateRfqItemDto[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  vendor_ids: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  committee_member_ids?: string[];

  @IsString()
  @IsOptional()
  bid_type?: string;

  @IsNumber()
  @IsOptional()
  round_no?: number;

  @IsNumber()
  @IsOptional()
  technical_weight?: number;

  @IsNumber()
  @IsOptional()
  commercial_weight?: number;

  @IsString()
  @IsOptional()
  shortlist_approver_id?: string;
}
