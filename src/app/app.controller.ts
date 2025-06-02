import { Controller, Get, Render, Request } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  @Render('index')
  root(@Request() req: any) {
    console.info(req.session.user);
    return req.session.user ? { user: req?.session?.user } : {};
  }

  @Get('/.well-known/appspecific/com.chrome.devtools.json')
  handleChromeDevToolsPing() {
    return {};
  }
}
