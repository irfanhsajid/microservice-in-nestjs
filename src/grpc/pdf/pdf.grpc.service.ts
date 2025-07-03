import { Metadata } from '@grpc/grpc-js';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  PDF_SERVICE_NAME,
  PDFServiceClient,
  ResponsePDFParsingPayload,
} from 'src/grpc/types/pdf-service/pdf-service.pb';

@Injectable()
export class PDFGrpcService {
  constructor(
    @Inject('PDF_PACKAGE')
    private grpcClient: ClientGrpc,
  ) {}

  async requestPdfParsing(dto: {
    url: string;
  }): Promise<Observable<ResponsePDFParsingPayload>> {
    const pdfService =
      this.grpcClient.getService<PDFServiceClient>(PDF_SERVICE_NAME);
    return new Promise((resolve, reject) => {
      const res = pdfService.requestPdfParsing(dto);

      const subscription = res.subscribe({
        next: (value: ResponsePDFParsingPayload) => {
          resolve(value as any);
          subscription.unsubscribe();
        },
        error: (err) => {
          reject(new BadRequestException(err));
        },
        complete: () => {
          reject(new Error('No data received'));
        },
      });
    });
  }
}
