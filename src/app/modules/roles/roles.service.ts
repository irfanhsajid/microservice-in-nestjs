import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { RoleHasPermissions } from './entities/role_has_permissions.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RoleHasPermissions)
    private readonly rhpRepository: Repository<RoleHasPermissions>,
  ) {}

  async create(dto: CreateRoleDto, dealerId: number | null) {
    const { name, status, guard, permission_ids } = dto;

    // Check valid permission ids
    await this.isAllValidPermissionIds(permission_ids);

    const role = await this.roleRepository.save({
      name,
      status,
      dealership_id: dealerId,
      guard,
      role_has_permissions: dto.permission_ids.map((id) => ({
        permission_id: id,
      })),
    });

    return role;
  }

  async findAll(dealerId: number | null) {
    if (!dealerId) {
      return await this.roleRepository.find({
        relations: ['role_has_permissions', 'role_has_permissions.permission'],
      });
    }
    return await this.roleRepository.find({
      where: { dealership_id: dealerId },
      relations: ['role_has_permissions', 'role_has_permissions.permission'],
    });
  }

  async findOne(id: number, dealerId: number | null) {
    if (!dealerId) {
      const role = await this.roleRepository.findOne({
        where: { id: id },
        relations: ['role_has_permissions', 'role_has_permissions.permission'],
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      return role;
    } else {
      const role = await this.roleRepository.findOne({
        where: { id: id, dealership_id: dealerId },
        relations: ['role_has_permissions', 'role_has_permissions.permission'],
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      return role;
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { name, status, guard, permission_ids } = updateRoleDto;

    if (permission_ids && permission_ids?.length > 0) {
      // Check valid permission ids
      await this.isAllValidPermissionIds(permission_ids);
    }

    const role = await this.roleRepository.findOne({
      where: { id: id },
      relations: ['role_has_permissions', 'role_has_permissions.permission'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    Object.assign(role, { name, status, guard });

    if (permission_ids && permission_ids?.length > 0) {
      await this.rhpRepository.delete({ role_id: id });

      role.role_has_permissions = permission_ids.map((pid) => {
        const rhp = new RoleHasPermissions();
        rhp.role_id = id;
        rhp.permission_id = pid;
        return rhp;
      });
    }

    await this.roleRepository.save(role);

    return role;
  }

  async remove(id: number) {
    const role = await this.roleRepository.findOne({ where: { id: id } });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    await this.roleRepository.remove(role);

    return `Role with ID ${id} has been deleted.`;
  }

  async isAllValidPermissionIds(permissionIds: number[]) {
    // Valid ids
    const validPermissionIds = await this.permissionRepository.findBy({
      id: In(permissionIds),
    });

    if (validPermissionIds.length !== permissionIds.length) {
      // Invalid ids
      const invalidIds = permissionIds.filter(
        (id) => !validPermissionIds.some((perm) => perm.id === id),
      );

      throw new UnprocessableEntityException({
        permissions: [
          `The following permission IDs are not valid: ${invalidIds.join(', ')}`,
        ],
      });
    }

    return validPermissionIds;
  }
}
