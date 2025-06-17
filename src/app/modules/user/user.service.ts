import {
  HttpException,
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
import { CustomLogger } from '../logger/logger.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';

@Injectable()
export class UserService {
  private readonly logger = new CustomLogger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      // Check if user already exists by email
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
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          'Failed to create user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  async validateUser(dto: SigninDto): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(dto.email);
      if (!user) {
        return null;
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

  async CheckEmailVerifyedat(email: string): Promise<boolean> {
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

  async updateEmailVerifyedAt(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return null;
      }

      user.email_verified_at = new Date();
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to update email_verified_at for ${email}: ${error}`,
      );
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async getById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: id },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email },
    });
  }
}
