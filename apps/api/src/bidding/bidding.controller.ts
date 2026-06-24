import { Controller, Post, Get, Param, Body, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BiddingService } from './bidding.service';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { SubmitQuoteDto } from './dto/submit-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bidding')
@UseGuards(JwtAuthGuard)
export class BiddingController {
  constructor(private readonly biddingService: BiddingService) {}

  @Post('rfq')
  async createRFQ(@Body() dto: CreateRfqDto, @Req() req: any) {
    const { userId } = req.user;
    return this.biddingService.createRFQ(dto, userId);
  }

  @Get('rfq')
  async listRFQs() {
    return this.biddingService.listRFQs();
  }

  @Get('vendor/rfq')
  async listVendorRFQs(@Req() req: any) {
    const { userId: vendorId } = req.user;
    return this.biddingService.listVendorRFQs(vendorId);
  }

  @Get('rfq/:id')
  async getRFQDetails(@Param('id') id: string) {
    return this.biddingService.getRFQDetails(id);
  }

  @Get('rfq/:id/comparison')
  async getComparison(@Param('id') id: string, @Req() req: any) {
    return this.biddingService.getComparison(id, req.user);
  }

  @Post('rfq/:id/award/:quoteId')
  async awardBid(@Param('id') id: string, @Param('quoteId') quoteId: string, @Req() req: any) {
    const { userId, companyId } = req.user;
    return this.biddingService.awardBid(id, quoteId, userId, companyId);
  }

  @Post('rfq/:id/escalate')
  async escalateWinnerTimeout(@Param('id') id: string, @Req() req: any) {
    const { userId } = req.user;
    return this.biddingService.escalateWinnerTimeout(id, userId);
  }

  @Post('quote')
  async submitQuotation(@Body() dto: SubmitQuoteDto, @Req() req: any) {
    const { userId: vendorId } = req.user;
    return this.biddingService.submitQuotation(dto, vendorId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/quotations',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `quote-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/)) {
          return callback(new BadRequestException('อนุญาตเฉพาะไฟล์ PDF, JPG, JPEG, PNG เท่านั้น'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  uploadQuotation(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('ไม่พบไฟล์ที่อัปโหลด');
    }
    return {
      file_url: `/uploads/quotations/${file.filename}`,
    };
  }
}
