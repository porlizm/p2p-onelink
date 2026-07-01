import { Controller, Post, Get, Param, Body, UseGuards, Req, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { PoService } from './po.service';
import { ConvertPrToPoDto, ConfirmPoDto, RequestRevisionDto, RevisePoDto } from './dto/po.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('po')
@UseGuards(JwtAuthGuard)
export class PoController {
  constructor(private readonly poService: PoService) {}

  @Post('convert/:prId')
  async convertPrToPo(@Param('prId') prId: string, @Body() dto: ConvertPrToPoDto, @Req() req: any) {
    const { userId } = req.user;
    return this.poService.convertPrToPo(prId, userId, dto.vendor_id);
  }

  @Get()
  async listPOs(@Req() req: any) {
    const { userId } = req.user;
    return this.poService.listPOs(userId);
  }

  @Get('vendor/orders')
  async listVendorPOs(@Req() req: any) {
    const { userId: vendorId } = req.user;
    return this.poService.listVendorPOs(vendorId);
  }

  @Get(':id')
  async getPODetails(@Param('id') id: string) {
    return this.poService.getPODetails(id);
  }

  @Post(':id/confirm')
  async confirmPO(
    @Param('id') id: string,
    @Body() dto: ConfirmPoDto,
    @Req() req: any,
  ) {
    const { userId: vendorId } = req.user;
    return this.poService.confirmPO(id, vendorId, dto);
  }

  @Post(':id/revision-request')
  async requestRevision(
    @Param('id') id: string,
    @Body() dto: RequestRevisionDto,
    @Req() req: any,
  ) {
    const { userId: vendorId } = req.user;
    return this.poService.requestRevision(id, vendorId, dto);
  }

  @Patch(':id/revise')
  async revisePO(
    @Param('id') id: string,
    @Body() dto: RevisePoDto,
    @Req() req: any,
  ) {
    const { userId } = req.user;
    return this.poService.revisePO(id, dto, userId);
  }

  @Patch(':id/cancel')
  async cancelPO(@Param('id') id: string, @Req() req: any) {
    const { userId } = req.user;
    return this.poService.cancelPO(id, userId);
  }

  @Patch(':id/approve')
  async approvePO(@Param('id') id: string, @Req() req: any) {
    const { userId } = req.user;
    return this.poService.approvePO(id, userId);
  }

  @Patch(':id/reject')
  async rejectPO(@Param('id') id: string, @Req() req: any) {
    const { userId } = req.user;
    return this.poService.rejectPO(id, userId);
  }
}
