import { Module } from '@nestjs/common';
import { MagazineService } from './magazine.service';
import { MagazineController } from './magazine.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploads/upload.service';
import { PdfService } from 'src/pdf/pdf.service';

@Module({
  providers: [MagazineService, PrismaService, UploadService, PdfService],
  controllers: [MagazineController]
})
export class MagazineModule { }
