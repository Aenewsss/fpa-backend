import { Module } from '@nestjs/common';
import { UsageTermsPageService } from './usage-terms-page.service';
import { UsageTermsPageController } from './usage-terms-page.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [UsageTermsPageService, PrismaService],
  controllers: [UsageTermsPageController]
})
export class UsageTermsPageModule {}
