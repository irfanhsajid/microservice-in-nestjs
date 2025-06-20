import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleHasPermission } from './role-has-permission.entity';
import { UserRoleDealership } from './user-role-dealership.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  guard: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => RoleHasPermission, (rolePermission) => rolePermission.role)
  permissions: RoleHasPermission[];

  @OneToMany(() => UserRoleDealership, (userRole) => userRole.role)
  user_roles: UserRoleDealership[];
}
