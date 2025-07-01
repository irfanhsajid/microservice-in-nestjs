import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CustomLogger } from '../../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { parseCarfaxPDF } from 'src/app/common/utils/carfax.parser';
import { writeFile } from 'fs/promises';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
        const { reportId, filePath } = job.data;

        try {
          // Parse PDF
          console.time('parseCarfaxPDF'); // Start timer
          const parsedResult = await parseCarfaxPDF(filePath);

          await writeFile(
            '/home/mrk/Desktop/project/carvu/output.json',
            JSON.stringify(parsedResult, null, 2),
            'utf-8',
          );

          console.timeEnd('parseCarfaxPDF');
          console.log('Saved to output.json');

          // Optionally: store parsed JSON in DB
          // await this.dataSource
          //   .createQueryBuilder()
          //   .update(VehicleFaxReport)
          //   .set({ json_result: parsedResult }) // assume you have a `json_result` column (jsonb or text)
          //   .where('id = :id', { id: reportId })
          //   .execute();

          return { status: 'success', reportId };
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
