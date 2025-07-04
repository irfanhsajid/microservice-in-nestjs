import { BadRequestException, Injectable } from '@nestjs/common';
import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { CustomLogger } from '../../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DealershipAddress } from '../entities/dealership-address.entity';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import {
  DealershipAddressCreateDto,
  DealershipAddressDto,
  DealershipAddressQueryDto,
} from '../dto/dealership-address.dto';
import { Repository } from 'typeorm';
import { UserDealership } from '../entities/user-dealership.entity';

@Injectable()
export class DealershipAddressService implements ServiceInterface {
  private readonly logger = new CustomLogger(DealershipAddressService.name);

  constructor(
    @InjectRepository(DealershipAddress)
    private readonly dealershipAddressRepository: Repository<DealershipAddress>,
  ) {}
  async index(
    req: Request,
    params: DealershipAddressQueryDto,
  ): Promise<Record<string, any>> {
    try {
      const userDealership = req['user_default_dealership'] as UserDealership;
      return await this.dealershipAddressRepository.find({
        where: {
          dealership_id: userDealership.dealership_id,
          type: params.type,
        },
      });
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
  async store(
    req: Request,
    dto: DealershipAddressCreateDto,
  ): Promise<Record<string, any>> {
    try {
      const userDealership = req['user_default_dealership'] as UserDealership;

      if (!userDealership) {
        throw new BadRequestException(
          `You don't have a dealership!, Please apply for dealership`,
        );
      }

      const newDealershipAddress = this.dealershipAddressRepository.create({
        ...dto,
        dealership_id: userDealership.dealership_id,
      });

      return await this.dealershipAddressRepository.save(newDealershipAddress);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
  show(req: Request, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }
  update(req: Request, dto: any, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }
  destroy(req: Request, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }
}
