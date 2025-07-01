import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { UpdateDealershipStatusDto } from '../dto/update-dealership-status.dto';
import { UserDealership } from 'src/app/modules/dealership/entities/user-dealership.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Dealership } from 'src/app/modules/dealership/entities/dealerships.entity';
import paginate from 'src/app/common/pagination/paginate';

@Injectable()
export class AdminDealershipService implements ServiceInterface {
  constructor(
    @InjectRepository(UserDealership)
    private readonly userDealershipRepository: Repository<UserDealership>,

    @InjectRepository(Dealership)
    private readonly dealershipRepository: Repository<Dealership>,
  ) {}

  destroy(req: Request, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }

  async index(req: Request, params: any): Promise<Record<string, any>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || '';
    const orderBy = params.sort_column || 'name';
    const orderDirection = params.sort_direction || 'asc';

    const dealershipsQuery = this.dealershipRepository
      .createQueryBuilder('dealership')
      .leftJoinAndSelect('dealership.vechicle_vins', 'vechicle_vins')
      .leftJoinAndSelect('dealership.user_dealerships', 'user_dealerships')
      .loadRelationCountAndMap(
        'dealership.total_listings',
        'dealership.vechicle_vins',
      )
      .where('dealership.name ILIKE :search', { search: `%${search}%` })
      .select([
        'dealership.id',
        'dealership.name',
        'dealership.email',
        'user_dealerships.status',
        'dealership.created_at',
        'dealership.updated_at',
      ])
      .orderBy(
        orderBy === 'status'
          ? 'user_dealerships.status'
          : `dealership.${orderBy}`,
        orderDirection.toUpperCase(),
      );

    return await paginate(dealershipsQuery, {
      page,
      limit,
    });
  }

  async show(req: Request, id: number): Promise<Record<string, any>> {
    const dealership = await this.dealershipRepository.findOne({
      where: {
        id,
      },
    });

    if (!dealership) {
      throw new NotFoundException(`Dealership with ID ${id} not found`);
    }

    return dealership;
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
