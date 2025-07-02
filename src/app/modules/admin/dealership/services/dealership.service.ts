import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { UpdateDealershipStatusDto } from '../dto/update-dealership-status.dto';
import {
  UserDealership,
  UserDealershipStatus,
} from 'src/app/modules/dealership/entities/user-dealership.entity';
import {
  Between,
  FindOptionsWhere,
  ILike,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
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

    const paginatedDealerships = await paginate(dealershipsQuery, {
      page,
      limit,
    });

    paginatedDealerships.data.forEach((dealership: any) => {
      dealership.last_active = new Date(); // Dummy data
      dealership.total_sold = 0; // Dummy data
      dealership.sell_rate = 0.0; // Dummy data
    });

    // Statistics
    const totalDealersStats = await this.getCountWithGrowth({});

    const activeDealersStats = await this.getCountWithGrowth({
      user_dealerships: {
        status: UserDealershipStatus.APPROVED,
      },
    });

    const paidDealerStats = await this.getCountWithGrowth({
      user_dealerships: {
        status: UserDealershipStatus.REQUESTED, // Dummy Data
      },
    });

    const statistics = {
      total_dealers: totalDealersStats,
      active_dealers: activeDealersStats,
      paid_dealers: paidDealerStats,
    };

    return {
      ...paginatedDealerships,
      statistics,
    };
  }

  async show(req: Request, id: number): Promise<Record<string, any>> {
    const dealership = await this.dealershipRepository
      .createQueryBuilder('dealership')
      .leftJoinAndSelect('dealership.user_dealerships', 'user_dealerships')
      .leftJoinAndSelect('dealership.addresses', 'addresses')
      .leftJoinAndSelect('dealership.payment_infos', 'payment_infos')
      .leftJoinAndSelect('dealership.attachments', 'attachments')
      .loadRelationCountAndMap(
        'dealership.total_listings',
        'dealership.vechicle_vins',
      )
      .addSelect('10', 'total_revenue')
      .where('dealership.id = :id', { id })
      .getOne();

    if (!dealership) {
      throw new NotFoundException(`Dealership with ID ${id} not found`);
    }

    return {
      ...dealership,
      total_revenue: 0,
      total_sold: 0,
      total_sold_revenue: 0,
    };
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

  getPercentageIncrease(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  getStartOfThisMonth() {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return startOfThisMonth;
  }

  getStartOfLastMonth() {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return startOfLastMonth;
  }

  getEndOfLastMonth() {
    const now = new Date();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return endOfLastMonth;
  }

  async getTotalDealersWithGrowth(): Promise<{
    count: number;
    growth: number;
  }> {
    // Count of dealerships created last month
    const lastMonthCount = await this.dealershipRepository.count({
      where: {
        created_at: Between(
          this.getStartOfLastMonth(),
          this.getEndOfLastMonth(),
        ),
      },
    });

    // Count of dealerships created this month
    const thisMonthCount = await this.dealershipRepository.count({
      where: {
        created_at: MoreThanOrEqual(this.getStartOfThisMonth()),
      },
    });

    // Count of all dealerships
    const totalCount = await this.dealershipRepository.count();

    const growth = this.getPercentageIncrease(thisMonthCount, lastMonthCount);

    return {
      count: totalCount,
      growth,
    };
  }

  async getCountWithGrowth(
    where: FindOptionsWhere<Dealership> = {},
  ): Promise<{ count: number; growth: number }> {
    const lastMonthCount = await this.dealershipRepository.count({
      where: {
        ...where,
        created_at: Between(
          this.getStartOfLastMonth(),
          this.getEndOfLastMonth(),
        ),
      },
    });

    const thisMonthCount = await this.dealershipRepository.count({
      where: {
        ...where,
        created_at: MoreThanOrEqual(this.getStartOfThisMonth()),
      },
    });

    const totalCount = await this.dealershipRepository.count({
      where,
    });

    const growth = this.getPercentageIncrease(thisMonthCount, lastMonthCount);

    return {
      count: totalCount,
      growth,
    };
  }
}
