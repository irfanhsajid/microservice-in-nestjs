import { Injectable } from '@nestjs/common';
import { OnboardingInterface } from './interfaces/onboard.interface';
import { DealershipDeatilsDto } from '../dto/dealership-details.dto';

@Injectable()
export class DealershipInformationService implements OnboardingInterface<any> {
  show(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  updateOrCreate(dto: DealershipDeatilsDto): Promise<any> {
    console.info(dto);
    throw new Error('Method not implemented.');
  }
}
