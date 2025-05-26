import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('auth')
export class AuthConsumer extends WorkerHost {
  // eslint-disable-next-line @typescript-eslint/require-await
  async process(job: Job, token?: string): Promise<any> {
    switch (job.name) {
      case 'send-otp': {
        console.info('task run');
        console.info('token', token);
        console.info(job.data);
      }
    }
  }
}
