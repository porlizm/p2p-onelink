import { Controller, Get, Post, Body, Param, Ip } from '@nestjs/common';
import { ContractService } from './contract.service';

@Controller('api')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post('contract')
  async createContract(
    @Body() body: {
      vendor_id: string;
      title: string;
      start_date: string;
      end_date: string;
      total_amount: number;
      document_url?: string;
    },
  ) {
    return this.contractService.createContract(body);
  }

  @Get('contract')
  async getContracts() {
    return this.contractService.getContracts();
  }

  @Get('contract/vendor/:vendorId')
  async getContractsByVendor(@Param('vendorId') vendorId: string) {
    return this.contractService.getContractsByVendor(vendorId);
  }

  @Post('contract/:id/sign')
  async signContract(
    @Param('id') id: string,
    @Body() body: { role: 'buyer' | 'vendor'; name: string; ip?: string },
    @Ip() clientIp: string,
  ) {
    const ip = body.ip || clientIp || '127.0.0.1';
    return this.contractService.signContract(id, {
      role: body.role,
      name: body.name,
      ip,
    });
  }
}
