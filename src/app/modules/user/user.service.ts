import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

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
      return user;
    } catch (error) {
      console.info('user getting error', error);
      return null;
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
