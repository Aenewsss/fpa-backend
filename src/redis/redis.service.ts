// src/redis/redis.service.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private redis: Redis;

    constructor() {
        this.redis = new Redis(process.env.UPSTASH_REDIS_REST_URL, {
            password: process.env.UPSTASH_REDIS_REST_TOKEN,
            tls: {},
        })
    }

    async setCode(email: string, code: string) {
        const key = `reset:code:${email}`;
        await this.redis.set(key, code, 'EX', 300); // 5 min
    }

    async getCode(email: string) {
        return this.redis.get(`reset:code:${email}`);
    }

    async deleteCode(email: string) {
        return this.redis.del(`reset:code:${email}`);
    }
}