import { Injectable } from '@nestjs/common';
import { OnboardingInterface } from './interfaces/onboard.interface';
import { DealershipPaymentInfo } from '../entities/dealership-payment-info.entity';

@Injectable()
export class DealershipPaymentInfoService
  implements OnboardingInterface<DealershipPaymentInfo>
{
  show(): Promise<DealershipPaymentInfo> {
    throw new Error('Method not implemented.');
  }
  updateOrCreate(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
