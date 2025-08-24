import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailService } from 'src/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, MailService, RedisService],
  exports: [UsersService],
})
export class UsersModule {}
