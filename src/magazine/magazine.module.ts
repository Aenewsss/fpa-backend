import { Module } from '@nestjs/common';
import { MagazineService } from './magazine.service';
import { MagazineController } from './magazine.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploads/upload.service';

@Module({
  providers: [MagazineService, PrismaService, UploadService],
  controllers: [MagazineController]
})
export class MagazineModule { }
