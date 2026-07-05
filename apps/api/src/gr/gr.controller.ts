import { Controller, Post, Patch, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { GrService } from './gr.service';
import { CreateGrDto, CreateClaimDto, MatchGrToPoDto, QcDecisionDto } from './dto/gr.dto';
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

  @Post(':id/match-po')
  async matchGrToPo(
    @Param('id') id: string,
    @Body() dto: MatchGrToPoDto,
    @Req() req: any,
  ) {
    const { userId } = req.user;
    return this.grService.matchGrToPo(id, dto, userId);
  }

  @Patch(':id/qc-decision')
  async submitQcDecision(
    @Param('id') id: string,
    @Body() dto: QcDecisionDto,
    @Req() req: any,
  ) {
    const { userId } = req.user;
    return this.grService.submitQcDecision(id, dto, userId);
  }
}
