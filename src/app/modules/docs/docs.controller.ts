import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';
import { CustomLogger } from '../logger/logger.service';
import { LoginThrottlerGuard } from '../throttler/login-throttler.guard';
import { LoginDto } from './dto/login.dto';
import { SessionGuard } from './guards/session.guard';
@ApiExcludeController()
@Controller('')
export class DocsAuthController {
  private readonly logger = new CustomLogger(DocsAuthController.name);

  @UseGuards(LoginThrottlerGuard)
  @Post('login')
  login(@Body() loginDto: LoginDto, @Session() session: Record<string, any>) {
    // For simplicity, we're using hardcoded credentials
    // In a real application, this should validate against your database
    if (
      loginDto.email === 'admin@carvu.com' &&
      loginDto.password === 'password'
    ) {
      session['user'] = {
        id: 1,
        email: loginDto.email,
        name: 'CarVu Devs',
      };
      this.logger.log('Login successful');
      return { message: 'Login successful' };
    }

    return { message: 'Invalid credentials', statusCode: 401 };
  }

  @Get('logout')
  @UseGuards(SessionGuard)
  logout(@Req() request: Request) {
    request.session.destroy(() => {
      // Session destroyed
      this.logger.log('Logout successful');
    });

    return { message: 'Logout successful' };
  }

  @Get('check')
  checkAuth(@Session() session: Record<string, any>) {
    if (session['user']) {
      return {
        authenticated: true,
        user: session['user'],
      };
    }

    return { authenticated: false };
  }
}
