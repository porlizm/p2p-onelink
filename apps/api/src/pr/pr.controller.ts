import { Controller, Post, Get, Patch, Param, Body, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrService } from './pr.service';
import { CreatePrDto } from './dto/create-pr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pr')
@UseGuards(JwtAuthGuard)
export class PrController {
  constructor(private readonly prService: PrService) {}

  @Post()
  async create(@Body() createPrDto: CreatePrDto, @Req() req: any) {
    const { userId, companyId } = req.user;
    return this.prService.createPR(createPrDto, userId, companyId);
  }

  @Get()
  async findAll(@Req() req: any) {
    const { userId } = req.user;
    return this.prService.listPRs(userId);
  }

  @Get('cost-centers')
  async getCostCenters() {
    return this.prService.getCostCenters();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const { userId } = req.user;
    return this.prService.getPRDetails(id, userId);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Req() req: any) {
    const { userId } = req.user;
    return this.prService.approvePR(id, userId);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Req() req: any) {
    const { userId } = req.user;
    return this.prService.rejectPR(id, userId);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req: any) {
    const { userId } = req.user;
    return this.prService.cancelPR(id, userId);
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
