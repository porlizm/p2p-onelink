import { Controller, Post, Get, Patch, Body, Param, Query, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, VendorStatus } from '@p2p/shared';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  // Public: Register new vendor
  @Post('register')
  async register(@Body() dto: CreateVendorDto) {
    return this.vendorService.register(dto);
  }

  // Public: Upload document attachment
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/)) {
          return callback(new BadRequestException('อนุญาตเฉพาะไฟล์ PDF, JPG, JPEG, PNG เท่านั้น'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('ไม่พบไฟล์ที่อัปโหลด');
    }
    return {
      file_url: `/uploads/documents/${file.filename}`,
    };
  }

  // Secure: List all vendors (Buyer, Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER, UserRole.ADMIN)
  @Get()
  async findAll(@Query('status') status?: VendorStatus) {
    return this.vendorService.findAll(status);
  }

  // Secure: Get vendor details (Buyer, Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER, UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  // Secure: Verify/approve/reject vendor status (Buyer, Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER, UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateVendorStatusDto) {
    return this.vendorService.updateStatus(id, dto);
  }
}
