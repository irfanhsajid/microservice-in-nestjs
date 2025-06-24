import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity('role_has_permissions')
export class RoleHasPermissions {
  @PrimaryColumn({ type: 'int' })
  role_id: number;

  @PrimaryColumn({ type: 'int' })
  permission_id: number;

  @ManyToOne(() => Role, (role) => role.role_has_permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(
    () => Permission,
    (permission) => permission.role_has_permissions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
