// src/twitter/twitter.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './twitter.service';

@Module({
  imports: [HttpModule],
  controllers: [TwitterController],
  providers: [TwitterService],
})
export class TwitterModule {}