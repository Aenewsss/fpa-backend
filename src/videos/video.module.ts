import { Module } from '@nestjs/common';
import { VideosService } from './video.service';
import { VideosController } from './video.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploads/upload.service';

@Module({
  providers: [VideosService, PrismaService, UploadService],
  controllers: [VideosController]
})
export class VideosModule { }
