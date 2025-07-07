import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { PaginationEnum } from '../../common/enums/pagination.enum';
import { User } from 'src/app/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import paginate from 'src/app/common/pagination/paginate';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreateAdminUserDto } from '../dto/create-user.dto';
import { UserDealership } from 'src/app/modules/dealership/entities/user-dealership.entity';
import { Role } from 'src/app/modules/roles/entities/role.entity';
import { UpdateAdminUserDto } from '../dto/update-user.dto';

@Injectable()
export class AdminUserService implements ServiceInterface {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly dataSource: DataSource,
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
        'user.last_login_at',
        'user_dealerships.status',
        'role.id',
        'role.name',
        'user.created_at',
      ])
      .orderBy('user.id', 'DESC');

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

  async store(
    req: Request,
    dto: CreateAdminUserDto,
  ): Promise<Record<string, any>> {
    const userDealership = req['user_default_dealership'] as UserDealership;

    // Validate role
    await this.validateRolePermission(
      dto.role_id,
      userDealership.dealership_id,
    );

    const createdUser = this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        ...dto,
        email_verified_at: new Date(),
        accept_privacy: true,
        status: true,
      });

      await manager.save(user);

      const userDealerships = manager.create(UserDealership, {
        role_id: dto.role_id,
        user_id: user.id,
        dealership_id: userDealership?.dealership_id,
        is_default: true,
      });

      await manager.save(userDealerships);

      return user;
    });

    return createdUser;
  }

  async update(
    req: Request,
    dto: UpdateAdminUserDto,
    id: number,
  ): Promise<Record<string, any>> {
    const userDealership = req['user_default_dealership'] as UserDealership;

    // Validate role
    await this.validateRolePermission(
      dto.role_id,
      userDealership.dealership_id,
    );

    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['user_dealerships'],
    });

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if user has permission to update this user
    if (
      updatedUser.user_dealerships?.findIndex(
        (user_dealership) =>
          user_dealership.dealership_id === userDealership.dealership_id,
      ) === -1
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this user.',
      );
    }

    // Update user
    Object.assign(updatedUser, dto);
    await this.userRepository.save(updatedUser);

    return updatedUser;
  }

  async validateRolePermission(roleId: number, dealershipId: number) {
    const role = await this.roleRepository.findOneBy({ id: roleId });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    if (role.dealership_id !== dealershipId) {
      throw new ForbiddenException(
        'You do not have permission to access this role.',
      );
    }

    return role;
  }
}
