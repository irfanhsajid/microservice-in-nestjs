import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { PaginationEnum } from '../../common/enums/pagination.enum';
import { User } from 'src/app/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import paginate from 'src/app/common/pagination/paginate';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class AdminUserService implements ServiceInterface {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  destroy(req: Request, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }

  async index(req: Request, params: any): Promise<Record<string, any>> {
    const page = params.page || PaginationEnum.DEFAULT_PAGE;
    const limit = params.limit || PaginationEnum.DEFAULT_LIMIT;
    const search = params.search || '';

    const usersQUery = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.user_dealerships', 'user_dealerships')
      .leftJoinAndSelect('user_dealerships.role', 'role')
      .where('user.name ILIKE :search', { search: `%${search}%` })
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.status',
        'user_dealerships.status',
        'role.id',
        'role.name',
        'user.created_at',
      ]);

    const users = await paginate(usersQUery, {
      page,
      limit,
    });

    return users;
  }

  async show(req: Request, id: number): Promise<Record<string, any>> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.user_dealerships', 'user_dealerships')
      .leftJoinAndSelect('user_dealerships.role', 'role')
      .where('user.id = :id', { id })
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.phone_number',
        'user_dealerships.status',
        'role.id',
        'role.name',
      ])
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  store(req: Request, dto: any): Record<string, any> {
    throw new Error('Method not implemented.');
  }

  update(req: Request, dto: any, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }
}
