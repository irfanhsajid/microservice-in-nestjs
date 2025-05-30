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

@ApiExcludeController()
@Controller()
export class DocsController {
  private readonly logger = new CustomLogger(DocsController.name);

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: any) {
    req.session.user = {
      id: req.user.id,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
    };
    return req.user;
  }

  @Post('logout')
  async logout(@Request() req: any, @Response({ passthrough: true }) res: any) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
          return reject(
            new UnauthorizedException('Session destruction failed'),
          );
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
        resolve(null);
      });
    });
  }
}
