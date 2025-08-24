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

    async set(key: string, value: string, expiresIn?: number) {
        expiresIn ? await this.redis.set(key, value, 'EX', expiresIn) : await this.redis.set(key, value);
    }

    async get(key: string) {
        return this.redis.get(key)
    }

    async delete(key: string) {
        return this.redis.del(key)
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

    async blacklistToken(token: string, ttlSeconds: number) {
        const key = `blacklist:token:${token}`;
        await this.redis.set(key, 'true', 'EX', ttlSeconds);
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        return (await this.redis.exists(`blacklist:token:${token}`) > 0);
    }
}