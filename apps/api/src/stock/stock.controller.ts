import { Controller, Get, Post, Query, Body, UseGuards, Req } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateTransferDto, CreateAdjustmentDto, CreateWriteOffDto, CreateCycleCountDto } from './dto/stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('movements')
  async listMovements(@Query('item_id') itemId?: string) {
    return this.stockService.listMovements(itemId);
  }

  @Get('near-expiry')
  async getNearExpiry(@Query('days') days?: string) {
    return this.stockService.getNearExpiry(days ? Number(days) : undefined);
  }

  @Get('low-stock')
  async getLowStock() {
    return this.stockService.getLowStock();
  }

  @Post('transfer')
  async createTransfer(@Body() dto: CreateTransferDto, @Req() req: any) {
    const { userId } = req.user;
    return this.stockService.createTransfer(dto, userId);
  }

  @Post('adjustment')
  async createAdjustment(@Body() dto: CreateAdjustmentDto, @Req() req: any) {
    const { userId } = req.user;
    return this.stockService.createAdjustment(dto, userId);
  }

  @Post('write-off')
  async createWriteOff(@Body() dto: CreateWriteOffDto, @Req() req: any) {
    const { userId } = req.user;
    return this.stockService.createWriteOff(dto, userId);
  }

  @Post('cycle-count')
  async createCycleCount(@Body() dto: CreateCycleCountDto, @Req() req: any) {
    const { userId } = req.user;
    return this.stockService.createCycleCount(dto, userId);
  }
}
