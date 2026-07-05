import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { VendorMessageService } from './vendor-message.service';

@Controller('vendor-message')
export class VendorMessageController {
  constructor(private readonly service: VendorMessageService) {}

  @Get('threads')
  async getThreads() {
    return this.service.getThreads();
  }

  @Get(':vendorId')
  async getMessages(@Param('vendorId') vendorId: string) {
    return this.service.getMessages(vendorId);
  }

  @Post()
  async sendMessage(
    @Body() body: { vendor_id: string; sender_role: 'Buyer' | 'Vendor'; sender_name: string; subject?: string; body: string },
  ) {
    return this.service.sendMessage(body);
  }

  @Post(':vendorId/read')
  async markRead(@Param('vendorId') vendorId: string, @Body('reader_role') readerRole: 'Buyer' | 'Vendor') {
    return this.service.markRead(vendorId, readerRole);
  }
}
