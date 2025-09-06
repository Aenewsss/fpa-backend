import { Module } from '@nestjs/common';
import { ContactPageService } from './contact-page.service';
import { ContactPageController } from './contact-page.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ContactPageService, PrismaService],
  controllers: [ContactPageController]
})
export class ContactPageModule {}
