import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  async create(dto: CreateRoleDto, dealerId: number) {
    const { name, permission_ids } = dto;
    const validPermissionIds = await this.getValidPermissionIds(permission_ids);

    if (validPermissionIds.length !== permission_ids.length) {
      // Invalid ids
      const invalidIds = permission_ids.filter(
        (id) => !validPermissionIds.some((perm) => perm.id === id),
      );

      throw new UnprocessableEntityException({
        permissions: [
          `The following permission IDs are not valid: ${invalidIds.join(', ')}`,
        ],
      });
    }

    const role = await this.roleRepository.save({
      name,
      dealership_id: dealerId,
      role_has_permissions: dto.permission_ids.map((id) => ({
        permission_id: id,
        role_id: dealerId,
      })),
    });

    return role;
  }

  findAll() {
    return `This action returns all roles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }

  async getValidPermissionIds(permissions: number[]) {
    // Valid ids
    const validPermissionIds = await this.permissionRepository.findBy({
      id: In(permissions),
    });

    return validPermissionIds;
  }
}
