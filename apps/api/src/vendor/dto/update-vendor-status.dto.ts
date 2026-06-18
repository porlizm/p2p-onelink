import { IsString, IsOptional, IsEnum } from 'class-validator';
import { VendorStatus } from '@p2p/shared';

export class UpdateVendorStatusDto {
  @IsEnum(VendorStatus)
  status: VendorStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}
