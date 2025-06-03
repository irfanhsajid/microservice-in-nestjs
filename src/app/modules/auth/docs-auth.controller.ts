import {
  Controller,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiExcludeController } from '@nestjs/swagger';
import { UserResource } from '../user/resource/user.resource';

@ApiExcludeController()
@Controller()
export class DocsController {
  private readonly logger = new CustomLogger(DocsController.name);

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: any) {
    req.session.user = new UserResource(req?.user);
    return req.user;
  }

  @Post('logout')
  async logout(@Request() req: any, @Response({ passthrough: true }) res: any) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
          reject(new UnauthorizedException('Session destruction failed'));
        } else {
          res.clearCookie('connect.sid');
          resolve({ message: 'Logout success' });
        }
      });
    });
  }
}
