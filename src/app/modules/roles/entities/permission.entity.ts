import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleHasPermissions } from './role_has_permissions.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, type: 'varchar', length: 100 })
  name: string;

  @Column({ nullable: false, type: 'varchar', length: 100 })
  title: string;

  @Column({ nullable: false, type: 'varchar', length: 100 })
  route: string;

  @ManyToOne(() => Permission, (permission) => permission.child_permissions)
  @JoinColumn({ name: 'parent_id' })
  parent_permission: Permission;

  @OneToMany(() => Permission, (permission) => permission.parent_permission)
  child_permissions: Permission[];

  @OneToMany(() => RoleHasPermissions, (rhp) => rhp.permission)
  role_has_permissions: RoleHasPermissions[];
}
