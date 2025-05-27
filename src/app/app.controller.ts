import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    console.info('rendering home');
    return { message: 'Hello world!' };
  }
}
