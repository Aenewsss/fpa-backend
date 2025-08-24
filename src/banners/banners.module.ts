import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploads/upload.service';

@Module({
  providers: [BannersService, PrismaService, UploadService],
  controllers: [BannersController]
})
export class BannersModule { }
