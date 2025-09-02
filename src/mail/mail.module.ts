// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    providers: [MailService, PrismaService],
    exports: [MailService],
    controllers: [MailController]
})
export class MailModule { }