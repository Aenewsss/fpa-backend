import { Module } from '@nestjs/common';
import { AboutPageService } from './about-page.service';
import { AboutPageController } from './about-page.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [AboutPageService, PrismaService],
  controllers: [AboutPageController]
})
export class AboutPageModule {}
