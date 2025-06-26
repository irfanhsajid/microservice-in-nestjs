import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { UpdateDealershipStatusDto } from '../dto/update-dealership-status.dto';
import { UserDealership } from 'src/app/modules/dealership/entities/user-dealership.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminDealershipService implements ServiceInterface {
  constructor(
    @InjectRepository(UserDealership)
    private readonly userDealershipRepository: Repository<UserDealership>,
  ) {}

  destroy(req: Request, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }

  index(req: Request, params: any): Record<string, any> {
    throw new Error('Method not implemented.');
  }

  show(req: Request, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }

  store(req: Request, dto: any): Record<string, any> {
    throw new Error('Method not implemented.');
  }

  update(req: Request, dto: any, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }

  async updateDealershipStatus(
    req: Request,
    dealershipId: number,
    dto: UpdateDealershipStatusDto,
  ) {
    const userDealership = await this.userDealershipRepository.findOne({
      where: {
        dealership_id: dealershipId,
      },
    });

    if (!userDealership) {
      throw new NotFoundException(
        `Dealership with ID ${dealershipId} not found`,
      );
    }

    userDealership.status = dto.status;
    await this.userDealershipRepository.save(userDealership);

    return userDealership;
  }
}
