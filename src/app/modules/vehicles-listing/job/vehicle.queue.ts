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

@Processor('vehicle-consumer')
export class VehicleConsumer extends WorkerHost {
  private readonly logger = new CustomLogger(VehicleConsumer.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'vehicle-fax-report': {
        this.logger.log('Running job for vehicle-fax-report');
        const { vehicleFaxReport, filePath, user } = job.data;

        try {
          // Parse PDF
          console.time('parseCarfaxPDF'); // Start timer
          const parsedResult = await parseCarfaxPDF(filePath);

          const newReport = new GenerateCarfaxReport(this.dataSource, {
            user: user as User,
            vehicleFaxReport,
            carfaxData: parsedResult,
          });

          console.log(await newReport.save());
          console.timeEnd('parseCarfaxPDF');
          console.log('Saved to output.json');

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
    }
  }
}
