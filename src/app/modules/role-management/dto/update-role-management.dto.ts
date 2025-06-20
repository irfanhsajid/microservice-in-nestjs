import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleManagementDto } from './create-role-management.dto';

export class UpdateRoleManagementDto extends PartialType(CreateRoleManagementDto) {}
