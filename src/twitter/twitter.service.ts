// src/twitter/twitter.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TwitterService {
    private readonly bearerToken = process.env.TWITTER_BEARER_TOKEN;

    async searchRecentTweets() {
        try {
            // 1. Descobre o ID do usuário via username
            const userResponse = await axios.get(
                `https://api.twitter.com/2/users/by/username/fpagropecuaria`,
                {
                    headers: {
                        Authorization: `Bearer ${this.bearerToken}`,
                    },
                }
            );
            console.log('userResponse.data', userResponse.data)
            const userId = userResponse.data?.data?.id;

            // 2. Busca os tweets pelo ID
            const tweetsResponse = await axios.get(
                `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,attachments&expansions=attachments.media_keys&media.fields=preview_image_url,url`,
                {
                    headers: {
                        Authorization: `Bearer ${this.bearerToken}`,
                    },
                }
            );
            return tweetsResponse.data;
        } catch (err) {
            console.error('Erro ao buscar tweets:', err.response?.data || err.message);
            return null
            // throw new InternalServerErrorException('Erro ao buscar tweets do Twitter');
        }
    }
}