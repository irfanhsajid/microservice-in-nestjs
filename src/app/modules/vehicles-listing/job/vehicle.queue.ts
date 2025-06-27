import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CustomLogger } from '../../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Processor('vehicle-consumer')
export class VehicleConsumer extends WorkerHost {
  private readonly logger = new CustomLogger(VehicleConsumer.name);

  constructor(private readonly configService: ConfigService) {
    super();
  }

  process(job: Job<any, any, string>): any {
    switch (job.name) {
      case 'vehicle-fax-report': {
        console.log('Running job for vehicle queue');
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
