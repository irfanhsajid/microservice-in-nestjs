import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserAccountType } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
import { CustomLogger } from '../logger/logger.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { UserDealership } from '../dealership/entities/user-dealership.entity';
import { UserResource } from './resource/user.resource';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly logger = new CustomLogger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserDealership)
    private readonly userDealershipRepository: Repository<UserDealership>,

    private jwtService: JwtService,

    protected readonly configService: ConfigService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      // Check if a user already exists by email
      const userExistWithEmail = await this.getUserByEmail(dto.email);

      if (userExistWithEmail) {
        throw new UnprocessableEntityException({
          email: ['email already exist'],
        });
      }

      const user = this.userRepository.create(dto);

      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async validateUser(dto: SigninDto): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(dto.email, false);
      if (!user) {
        return null;
      }
      if (user.account_type === UserAccountType.MODERATOR) {
        return user;
      }
      if (!(await user.comparePassword(dto.password))) {
        return null;
      }
      if (!user.status) {
        return null;
      }
      return user;
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async CheckEmailVerified(email: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return false;
      }
      if (!user.email_verified_at) {
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async CheckProfileCompleted(email: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return false;
      }
      if (
        user.account_type === UserAccountType.DEALER &&
        !user.profile_completed
      ) {
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async updateEmailVerifiedAt(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return null;
      }

      user.email_verified_at = new Date();
      const newUser = await this.userRepository.save(user);
      console.log(newUser);
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to update email_verified_at for ${email}: ${error}`,
      );
      return throwCatchError(error);
    }
  }

  async updatePassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return null;
      }

      user.password = password;
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.logger.error(`Failed to update password for ${email}: ${error}`);
      return throwCatchError(error);
    }
  }

  async getById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: id },
    });
  }

  async getUserByEmail(
    email: string,
    cache: boolean = false,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email },
      cache: cache,
    });
  }

  async userDefaultDealership(user: User): Promise<UserDealership | null> {
    try {
      return await this.userDealershipRepository.findOne({
        where: {
          user: {
            id: user?.id,
          },
          is_default: true,
        },
        cache: false,
      });
    } catch (e) {
      this.logger.error(e);
      return throwCatchError(e);
    }
  }

  async createOrLoginOauthUser({
    email,
    name,
    avatar,
  }: {
    email: string;
    name: string;
    avatar: string;
  }): Promise<any> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let user = await queryRunner.manager.findOne(User, {
        where: { email },
      });

      if (!user) {
        // Create a new user if not exists
        user = queryRunner.manager.create(User, {
          email,
          name,
          avatar,
          account_type: UserAccountType.BUYER,
          accept_privacy: true,
          password: this.configService.get('app.key'),
        });
        user = await queryRunner.manager.save(User, user);
        this.logger.log(`New Oauth user saved to database ${user.email}`);
      } else {
        queryRunner.manager.merge(User, user, {
          email,
          name,
          avatar,
        });
        user = await queryRunner.manager.save(User, user);
      }
      const token = await this.createJwtToken(user);

      // Commit the transaction
      await queryRunner.commitTransaction();
      return {
        ...token,
        user: new UserResource(user),
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error creating Oatuh user`, error);
      return throwCatchError(error);
    } finally {
      // Release the qury runner
      await queryRunner.release();
    }
  }

  async createJwtToken(
    user: User,
  ): Promise<{ access_token: string; expired_at: Date }> {
    try {
      const token = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });
      const expiresIn =
        this.configService.get<string>('session.token_lifetime') || '7d';
      // Calculate expiration time
      const expiresInSeconds = this.parseExpiresInToSeconds(expiresIn);
      const expiredAt = new Date(Date.now() + expiresInSeconds * 1000);

      return {
        access_token: token,
        expired_at: expiredAt,
      };
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  // Parse expiration time
  protected parseExpiresInToSeconds(expiresIn: string): number {
    const timeUnits: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    return value * timeUnits[unit];
  }
}
