// src/twitter/twitter.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { StandardResponse } from 'src/common/interfaces/standard-response.interface';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@Controller('twitter')
export class TwitterController {
    constructor(private readonly twitterService: TwitterService) { }

    @Get('search')
    async searchTweets(): Promise<StandardResponse> {
        return {
            data: this.twitterService.searchRecentTweets(),
            message: ResponseMessageEnum.TWEETS_FETCHED_SUCCESSFULLY,
        };
    }
}