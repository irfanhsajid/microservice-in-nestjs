import { Injectable } from '@nestjs/common';
import { PaymentInfoInterface } from './interfaces/paymentinfo.interface';
import { DealershipPaymentInfo } from '../entities/dealership-payment-info.entity';

@Injectable()
export class DealershipPaymentInfoService implements PaymentInfoInterface {
  show(): Promise<DealershipPaymentInfo> {
    throw new Error('Method not implemented.');
  }
  update(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
