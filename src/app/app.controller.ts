import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    console.info('rendering home');
    return { message: 'Hello world!' };
  }

  @Get('/.well-known/appspecific/com.chrome.devtools.json')
  handleChromeDevToolsPing() {
    return {};
  }
}
