import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserService } from '../user/user.service';
import { BlacklistTokenStorageProvider } from 'src/app/common/interfaces/blacklist-token-storeage-provider';
import { BlacklistTokenStore } from './entities/blacklist-token-store.entity';

@Injectable()
export class TypeOrmBlacklistTokenStorageProvider
  implements BlacklistTokenStorageProvider
{
  constructor(
    @InjectRepository(BlacklistTokenStore)
    private readonly tokenStoreRepository: Repository<BlacklistTokenStore>,
    private readonly userService: UserService,
  ) {}

  async storeToken(
    token: string,
    userId: number,
    expiresAt: Date,
  ): Promise<void> {
    const user = await this.userService.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const tokenStore = this.tokenStoreRepository.create({
      token,
      expiresAt,
      userId,
    });
    await this.tokenStoreRepository.save(tokenStore);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.tokenStoreRepository.findOne({
      where: { token },
    });
    return !!blacklisted;
  }

  async cleanExpiredTokens(): Promise<void> {
    await this.tokenStoreRepository.delete({ expiresAt: LessThan(new Date()) });
  }
}
