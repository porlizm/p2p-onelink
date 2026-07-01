import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { GrService } from './gr.service';
import { CreateGrDto, CreateClaimDto } from './dto/gr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('gr')
@UseGuards(JwtAuthGuard)
export class GrController {
  constructor(private readonly grService: GrService) {}

  @Post()
  async createGr(@Body() dto: CreateGrDto, @Req() req: any) {
    const { userId } = req.user;
    return this.grService.createGr(dto, userId);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.grService.findAll(req.user);
  }

  @Get('stock')
  async findStock() {
    return this.grService.findStock();
  }

  @Post('stock/sync')
  async syncStock() {
    return this.grService.syncStock();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.grService.findOne(id);
  }

  @Post(':id/claim')
  async createClaim(
    @Param('id') id: string,
    @Body() dto: CreateClaimDto,
    @Req() req: any,
  ) {
    const { userId } = req.user;
    return this.grService.createClaim(id, dto, userId);
  }
}
