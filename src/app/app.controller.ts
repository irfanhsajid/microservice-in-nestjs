import { Controller, Get, Query, Render, Request } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import * as os from 'os';
import { PDFGrpcService } from 'src/grpc/pdf/pdf.grpc.service';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly pdfGrpcService: PDFGrpcService) {}

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

  @Get('/host')
  handleGetHost() {
    return this.getLocalIpAddress();
  }

  getLocalIpAddress(): string | undefined {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (interfaces) {
        for (const iface of interfaces) {
          if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
          }
        }
      }
    }
    return undefined;
  }

  // test
  @Get('/rust')
  getRustPdfService(@Query() param: string) {
    console.log(param['url']);
    return this.pdfGrpcService.requestPdfParsing({ url: param['url'] });
  }
}
