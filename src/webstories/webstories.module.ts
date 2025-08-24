import { Module } from '@nestjs/common';
import { WebstoriesService } from './webstories.service';
import { WebstoriesController } from './webstories.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploads/upload.service';

@Module({
  providers: [WebstoriesService, PrismaService, UploadService],
  controllers: [WebstoriesController]
})
export class WebstoriesModule { }
