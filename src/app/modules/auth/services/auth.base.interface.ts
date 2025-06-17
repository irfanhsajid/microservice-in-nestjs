import { CreateUserDto } from '../../user/dto/create-user.dto';
import { User } from '../../user/entities/user.entity';
import { SigninDto } from '../../user/dto/signin.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerifyEmailDto } from '../dto/resend-verify-email.dto';

export interface AuthInterface {
  register(dto: CreateUserDto): Promise<User>;
  login(dto: SigninDto): Promise<any>;
  sendVerificationEmail(user: User): Promise<void>;
  verifyEmail(dto: VerifyEmailDto): Promise<any>;
  resendVerificationEmail(dto: ResendVerifyEmailDto): Promise<any>;
}
