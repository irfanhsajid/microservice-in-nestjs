import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
import { CustomLogger } from '../logger/logger.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { Dealership } from '../dealership/entities/dealerships.entity';

@Injectable()
export class UserService {
  private readonly logger = new CustomLogger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Dealership)
    private readonly dealershipRepository: Repository<Dealership>,
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
}
