import { Module } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CategoryController } from './categories.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploads/upload.service';

@Module({
  providers: [CategoryService, PrismaService, UploadService],
  controllers: [CategoryController]
})
export class CategoryModule { }
