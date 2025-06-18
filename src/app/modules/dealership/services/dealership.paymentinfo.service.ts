import { Injectable, NotFoundException } from '@nestjs/common';
import { OnboardingInterface } from './interfaces/onboard.interface';
import { DealershipPaymentInfo } from '../entities/dealership-payment-info.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDealership } from '../entities/user-dealership.entity';
import { Request } from 'express';
import { User } from '../../user/entities/user.entity';
import { DealershipPaymentInfoDto } from '../dto/dealership-paymentinfo.dto';

@Injectable()
export class DealershipPaymentInfoService
  implements OnboardingInterface<DealershipPaymentInfo>
{
  constructor(
    @InjectRepository(UserDealership)
    protected readonly userDealershipRepository: Repository<UserDealership>,

    @InjectRepository(DealershipPaymentInfo)
    protected readonly dealershipPaymentInfo: Repository<DealershipPaymentInfo>,
  ) {}
  async show(request: Request): Promise<DealershipPaymentInfo | null> {
    const user = request.user as User;
    const userDealership = await this.userDealershipRepository.findOne({
      where: {
        user: {
          id: user?.id,
        },
        is_default: true,
      },
    });

    return await this.dealershipPaymentInfo.findOne({
      where: {
        dealership: {
          id: userDealership?.dealership.id,
        },
        user: {
          id: user?.id,
        },
      },
    });
  }
  async updateOrCreate(
    request: Request,
    dto: DealershipPaymentInfoDto,
  ): Promise<any> {
    const user = request.user as User;
    const userDealership = await this.userDealershipRepository.findOne({
      where: {
        user: {
          id: user?.id,
        },
        is_default: true,
      },
    });

    const exitingPaymentInfo = await this.dealershipPaymentInfo.findOne({
      where: {
        user: {
          id: user?.id,
        },
        dealership: {
          id: userDealership?.dealership.id,
        },
      },
    });

    if (!exitingPaymentInfo) {
      throw new NotFoundException('Dealer payment info not found!');
    }

    this.dealershipPaymentInfo.merge(exitingPaymentInfo, dto);

    return null;
  }
}
