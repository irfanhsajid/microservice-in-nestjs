import { DealershipPaymentInfo } from '../../entities/dealership-payment-info.entity';

export interface PaymentInfoInterface {
  show(): Promise<DealershipPaymentInfo>;
  update(): Promise<any>;
}
