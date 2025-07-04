import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { globSync } from 'glob';
import { ConfigService } from '@nestjs/config';
import { protobufPackage } from 'src/grpc/types/auth/auth.pb';
import { PDFGrpcService } from './pdf.grpc.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'PDF_PACKAGE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: protobufPackage,
            protoPath: globSync('src/grpc/proto/carvu_proto/**/*.proto', {
              absolute: true,
            }),
            url: `[::1]:50051`,
          },
        }),
      },
    ]),
  ],
  controllers: [],
  providers: [PDFGrpcService],
  exports: [PDFGrpcService],
})
export class PdfGrpcModule {}
