import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CustomLogger } from '../../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { parseCarfaxPDF } from 'src/app/common/utils/carfax.parser';
import { writeFile } from 'fs/promises';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GenerateCarfaxReport } from './generate-carfax-report';
import { User } from '../../user/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { SmsService } from '../../sms/sms.service';
import { PDFGrpcService } from 'src/grpc/pdf/pdf.grpc.service';
import { ResponsePDFParsingPayload } from 'src/grpc/types/pdf-service/pdf-service.pb';
import { firstValueFrom } from 'rxjs';

@Processor('vehicle-consumer')
export class VehicleConsumer extends WorkerHost {
  private readonly logger = new CustomLogger(VehicleConsumer.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    protected readonly mailerService: MailerService,
    protected readonly smsService: SmsService,
    private readonly pdfGrpcService: PDFGrpcService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'vehicle-fax-report': {
        this.logger.log('Running job for vehicle-fax-report');
        const { vehicleFaxReport, filePath, user, local, localPath } = job.data;

        try {
          // Parse PDF
          console.time('parseCarfaxPDF'); // Start timer
          const parsedResult = await this.pdfGrpcService.requestPdfParsing({
            url: local ? localPath : filePath,
            local: local,
          });
          if (parsedResult.data) {
            const newReport = new GenerateCarfaxReport(this.dataSource, {
              user: user as User,
              vehicleFaxReport,
              carfaxData: parsedResult.data,
            });
            this.logger.log(await newReport.save());
          } else {
            this.logger.error(parsedResult.errors);
          }
          console.timeEnd('parseCarfaxPDF');

          // const newReport = new GenerateCarfaxReport(this.dataSource, {
          //   user: user as User,
          //   vehicleFaxReport,
          //   carfaxData: parsedResult,
          // });

          // console.log(await newReport.save());
          // console.timeEnd('parseCarfaxPDF');
          // console.log('Saved to output.json');

          return { status: 'success' };
        } catch (error) {
          this.logger.error(
            `Failed to parse PDF: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      }
      case 'vehicle-fax-report-apply': {
        console.log('vehicle fax reporte job running');
        const date = new Date();
        this.logger.log(
          `Queue process for vehicle fax report run on ${date.getTime()}`,
        );
        this.logger.log(`data ${job.data}`);
        return;
      }
      case 'vehicle-inspection-link': {
        console.log('sending vehicle inspection link');
        const { email, phone, vehicleId, token } = job.data;
        const url = `${this.configService.get<string>('app.web_url')}/vehicle-inspection?token=${token}&email=${email}&vehicleId=${vehicleId}`;
        if (email) {
          await this.mailerService.sendMail({
            to: email,
            subject: 'Vehicle inspection link',
            template: 'vehicle-inspection-link',
            context: {
              url,
            },
          });
        }
        if (phone) {
          await this.smsService.sendSms(
            phone,
            `Your vehicle inspection link is ${url}`,
          );
          this.logger.log(`SMS sent to ${phone} with link: ${url}`);
        }
        this.logger.log(
          `Queue process for send vehicle inspection link run on ${new Date().getTime()}`,
        );
        this.logger.log(`data ${job.data}`);
        return;
      }
    }
  }
}
