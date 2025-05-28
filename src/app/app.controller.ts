import { Controller, Get, Render, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  @Render('index')
  root(@Req() request: Request) {
    console.info('rendering home');
    return {
      message: 'Hello world!',
      user: request.session['user'] || null,
    };
  }

  @Get('/.well-known/appspecific/com.chrome.devtools.json')
  handleChromeDevToolsPing() {
    return {};
  }
}
