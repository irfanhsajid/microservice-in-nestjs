import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { In, Repository } from 'typeorm';
import { RoleHasPermission } from '../entities/role-has-permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RoleHasPermission)
    private roleHasPermissionRepository: Repository<RoleHasPermission>,
  ) {}
  async create(dto: CreateRoleDto) {
    const { name, permissions } = dto;

    const validPermissionIds = await this.validatePermissionIds(permissions);

    if (validPermissionIds.length !== permissions.length) {
      // Invalid ids
      const invalidIds = permissions.filter(
        (id) => !validPermissionIds.some((perm) => perm.id === id),
      );

      throw new UnprocessableEntityException({
        permissions: [
          `The following permission IDs are not valid: ${invalidIds.join(', ')}`,
        ],
      });
    }

    // Create role
    const role = await this.roleRepository.save({
      name,
    });

    // Create role has permission
    await this.roleHasPermissionRepository.save(
      validPermissionIds.map((permission) =>
        this.roleHasPermissionRepository.create({
          role_id: role.id,
          permission_id: permission.id,
        }),
      ),
    );

    return role;
  }

  async findAll() {
    const roles = await this.roleRepository.find({
      relations: ['roleHasPermissions', 'roleHasPermissions.permission'],
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      status: role.status,
      permissions: role.roleHasPermissions.map((rhp) => rhp.permission),
      created_at: role.created_at,
      updated_at: role.updated_at,
    }));
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

  async validatePermissionIds(permissions: number[]) {
    // Valid ids
    const validPermissionIds = await this.permissionRepository.findBy({
      id: In(permissions),
    });

    return validPermissionIds;
  }
}
