import { Module } from '@nestjs/common';
import { RelevantsService } from './relevants.service';
import { RelevantsController } from './relevants.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploads/upload.service';

@Module({
  providers: [RelevantsService, PrismaService, UploadService],
  controllers: [RelevantsController]
})
export class RelevantsModule { }
