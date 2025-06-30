import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Repository } from 'typeorm';
import { CustomLogger } from 'src/app/modules/logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../user/entities/user.entity';

@ValidatorConstraint({ name: 'isVehicleVinValid', async: true })
export class IsUnique implements ValidatorConstraintInterface {
  private readonly logger = new CustomLogger(IsUnique.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validate(email: string) {
    try {
      return await this.userRepository.exists({
        where: { email: email },
      });
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Email ${args.value} is already in use. Please use a different email.`;
  }
}
