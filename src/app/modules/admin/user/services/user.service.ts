import {
  BadRequestException,
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
import { FileUploaderService } from 'src/app/modules/uploads/file-uploader.service';
import { Readable } from 'stream';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { CustomLogger } from 'src/app/modules/logger/logger.service';
import { instanceToPlain } from 'class-transformer';
import { AdminUserChangePasswordDto } from '../dto/change-password.dto';
import { hashPassword } from 'src/app/common/utils/hash';

@Injectable()
export class AdminUserService implements ServiceInterface {
  private readonly logger = new CustomLogger(AdminUserService.name);
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly dataSource: DataSource,
    private fileUploaderService: FileUploaderService,
  ) {}

  async destroy(req: Request, id: number): Promise<Record<string, any>> {
    const userDealership = req['user_default_dealership'] as UserDealership;

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['user_dealerships'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.validateUserPermission(user, userDealership?.dealership_id);

    await this.userRepository.softDelete({ id });

    return user;
  }

  async index(req: Request, params: any): Promise<Record<string, any>> {
    const user_dealership = req['user_default_dealership'] as UserDealership;
    console.log('user_dealership', user_dealership);
    const page = params.page || PaginationEnum.DEFAULT_PAGE;
    const limit = params.limit || PaginationEnum.DEFAULT_LIMIT;
    const search = params.search || '';

    const usersQuery = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.user_dealerships', 'user_dealerships')
      .leftJoinAndSelect('user_dealerships.role', 'role')
      .where('user.name ILIKE :search', { search: `%${search}%` });

    // Filter by dealership
    if (user_dealership.dealership_id === null) {
      usersQuery.andWhere('user_dealerships.dealership_id IS NULL');
    } else {
      usersQuery.andWhere('user_dealerships.dealership_id = :dealershipId', {
        dealershipId: user_dealership.dealership_id,
      });
    }

    usersQuery
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

    const users = await paginate(usersQuery, {
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
        'user.avatar',
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

    // Validate user
    this.validateUserPermission(updatedUser, userDealership.dealership_id);

    // Update user
    Object.assign(updatedUser, dto);
    await this.userRepository.save(updatedUser);

    return updatedUser;
  }

  async uploadAvatar(
    req: Request,
    id: number,
    file: Express.Multer.File,
  ): Promise<Record<string, any>> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['user_dealerships'],
    });
    const userDealership = req['user_default_dealership'] as UserDealership;

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Validate user
    this.validateUserPermission(user, userDealership.dealership_id);

    let tempFilePath: string = '';

    const folder = `user/avatar`;

    const fileName = `${Date.now()}-${file.originalname}`;
    const key = `${folder}/${fileName}`;
    try {
      // Step 1: Delete old avatar if exists
      if (user.avatar) {
        await this.fileUploaderService.deleteFile(user.avatar);
      }

      // Step 2: Upload new avatar

      // Upload file stream to storage
      const filePath = await this.fileUploaderService.uploadStream(
        key,
        Readable.from(file.buffer),
        file.mimetype,
        file.size,
      );

      tempFilePath = `${folder}/${filePath}`;

      // save user avatar
      user.avatar = filePath;
      await this.userRepository.save(user);
      const data = instanceToPlain(user);
      delete data?.password;
      return {
        ...data,
        avatar: this.fileUploaderService.path(tempFilePath),
      };
    } catch (error) {
      // delete file if something went wrong
      if (tempFilePath) {
        await this.fileUploaderService.deleteFile(
          this.fileUploaderService.path(tempFilePath),
        );
      }
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async changePassword(
    req: Request,
    id: number,
    dto: AdminUserChangePasswordDto,
  ) {
    const user_dealership = req['user_default_dealership'] as UserDealership;
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['user_dealerships'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Validate user
    this.validateUserPermission(user, user_dealership.dealership_id);

    const isMatchCurrentPassword = await user.comparePassword(
      dto.current_password,
    );

    if (!isMatchCurrentPassword) {
      throw new BadRequestException('Current password is incorrect.');
    }

    user.password = await hashPassword(dto.password);
    await this.userRepository.save(user);
    const data = instanceToPlain(user);
    delete data?.password;
    return data;
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

  validateUserPermission(user: User, dealershipId: number) {
    // Check if user has permission to update this user
    const hasPermission = user.user_dealerships?.some(
      (user_dealership) => user_dealership.dealership_id === dealershipId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action on this user.',
      );
    }
  }
}
