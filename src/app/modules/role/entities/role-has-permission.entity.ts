import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity('role_has_permissions')
export class RoleHasPermission {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'integer', nullable: false })
  role_id: number;

  @Column({ type: 'integer', nullable: false })
  permission_id: number;

  @ManyToOne(() => Role, (role) => role.permissions)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.roles)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
