import { CreateUserDto } from '../dto/create-user.dto';
import { SigninDto } from '../../user/dto/signin.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerifyEmailDto } from '../dto/resend-verify-email.dto';
import { ResetPasswordDto } from '../dto/password-reset.dto';
import { NewPasswordDto } from '../dto/new-password.dto';

export interface AuthInterface {
  register(dto: CreateUserDto): Promise<any>;
  login(dto: SigninDto): Promise<any>;
  verifyEmail(dto: VerifyEmailDto): Promise<any>;
  resendVerificationEmail(dto: ResendVerifyEmailDto): Promise<any>;
  sendResetLink(dto: ResetPasswordDto): Promise<any>;
  resetPassword(dto: NewPasswordDto): Promise<any>;
}
