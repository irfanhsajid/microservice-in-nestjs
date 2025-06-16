import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { BlacklistTokenStorageProvider } from 'src/app/common/interfaces/blacklist-token-storeage-provider';
import Redis from 'ioredis';

@Injectable()
export class RedisBlacklistTokenStorageProvider
  implements BlacklistTokenStorageProvider
{
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async storeToken(
    token: string,
    userId: number,
    expiresAt: Date,
  ): Promise<void> {
    const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    console.log('actual expired time', expiresAt);
    console.log('generated one', ttl);
    await this.redis.set(`token:${userId}:${token}`, 'blacklisted', 'EX', ttl);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const keys = await this.redis.keys(`token:*:${token}`);
    console.log(keys);
    return keys.length > 0;
  }

  async cleanExpiredTokens(): Promise<void> {
    // Redis handles expiration automatically via TTL
    // No manual cleanup needed
  }
}
